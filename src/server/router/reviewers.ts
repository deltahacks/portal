import { z } from "zod";
import { protectedProcedure, router } from "./trpc";
import { TRPCError } from "@trpc/server";
import { Role, Status } from "@prisma/client";
import { assert, trpcAssert } from "../../utils/asserts";
import { DirectPrismaQuerier } from "../db/directQueries";

const ApplicationForReview = z.object({
  submitter: z.object({
    id: z.string(),
    name: z.string(),
    email: z
      .string()
      .nullable()
      .transform((v) => (v === null ? "" : v)),
  }),
  status: z.nativeEnum(Status),
  formYear: z.number(),
});

export type ApplicationForReview = z.infer<typeof ApplicationForReview>;

interface FormItem {
  question: string;
  answer: string | null;
}

export const reviewerRouter = router({
  getApplications: protectedProcedure
    .output(ApplicationForReview.array())
    .query(async ({ ctx }) => {
      trpcAssert(
        ctx.session.user.role.includes(Role.ADMIN) ||
          ctx.session.user.role.includes(Role.REVIEWER),
        "UNAUTHORIZED"
      );

      const querier = new DirectPrismaQuerier(ctx.prisma);
      const hackathonYear = await querier.getHackathonYear();

      const application = await ctx.prisma.formSubmission.findMany({
        where: {
          formYear: hackathonYear,
        },
        select: {
          status: true,
          formYear: true,
          submitter: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      return ApplicationForReview.array().parse(application);
    }),
  getApplication: protectedProcedure
    .input(
      z.object({
        submitterId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      trpcAssert(
        ctx.session.user.role.includes(Role.ADMIN) ||
          ctx.session.user.role.includes(Role.REVIEWER),
        "UNAUTHORIZED"
      );
      const querier = new DirectPrismaQuerier(ctx.prisma);
      const hackathonYear = await querier.getHackathonYear();
      const application = await ctx.prisma.formSubmission.findUniqueOrThrow({
        where: {
          formYear_submitterId: {
            formYear: hackathonYear,
            submitterId: input.submitterId,
          },
        },
        include: {
          form: {
            select: {
              questions: {
                select: {
                  question: {
                    include: {
                      answers: {
                        where: {
                          submitterId: input.submitterId,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });
      const answers = new Map<string, FormItem>();
      application.form.questions.forEach((questionStructure) => {
        assert(
          questionStructure.question.answers.length == 1,
          "Each answer has a unique submitter"
        );
        answers.set(questionStructure.question.id, {
          question: questionStructure.question.statement,
          answer: questionStructure.question.answers[0]?.statement ?? null,
        });
      });
      return answers;
    }),
  updateApplicationShallow: protectedProcedure
    .input(
      z.object({
        submitterId: z.string(),
        application: z.object({ status: z.nativeEnum(Status) }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      trpcAssert(
        ctx.session.user.role.includes(Role.ADMIN) ||
          ctx.session.user.role.includes(Role.REVIEWER),
        "UNAUTHORIZED"
      );

      const querier = new DirectPrismaQuerier(ctx.prisma);
      const hackathonYear = await querier.getHackathonYear();

      const formSubmission = await prisma?.formSubmission.update({
        where: {
          formYear_submitterId: {
            formYear: hackathonYear,
            submitterId: input.submitterId,
          },
        },
        data: input.application,
      });

      await ctx.logsnag.track({
        channel: "reviews",
        event: "Status Changed",
        user_id: `${ctx.session.user.name} - ${ctx.session.user.email}`,
        description: `${ctx.session.user.name} changed user ${formSubmission?.submitterId}'s status to ${input.application.status}`,
        tags: {
          status: input.application.status,
          reviewer: ctx.session.user.email ?? "",
        },
        icon:
          input.application.status === Status.ACCEPTED
            ? "✅"
            : input.application.status === Status.REJECTED
            ? "❌"
            : input.application.status === Status.WAITLISTED
            ? "🕰️"
            : input.application.status === Status.RSVP
            ? "🎟️"
            : "🤔",
      });
    }),
  submit: protectedProcedure
    .input(z.object({ mark: z.number(), hackerId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (
        !(
          ctx.session.user.role.includes(Role.ADMIN) ||
          ctx.session.user.role.includes(Role.REVIEWER)
        )
      ) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      // count reviews for a hacker.
      // if we have 3 already, deny making any more reviews
      const reviewCount = await ctx.prisma.review.count({
        where: {
          hackerId: input.hackerId,
        },
      });
      if (reviewCount >= 3) {
        throw new TRPCError({ code: "CONFLICT" });
      }

      const res = await ctx.prisma.review.findFirst({
        where: {
          hackerId: input.hackerId,
          reviewerId: ctx.session.user.id,
        },
      });
      if (res) {
        throw new TRPCError({ code: "CONFLICT", message: "Duplicate Review" });
      }
      await ctx.prisma.review.create({
        data: {
          hackerId: input.hackerId,
          reviewerId: ctx.session.user.id,
          mark: input.mark,
        },
      });
    }),
});
