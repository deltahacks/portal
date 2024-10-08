import { z } from "zod";
import { protectedProcedure, router } from "./trpc";
import { TRPCError } from "@trpc/server";
import { Role, Status } from "@prisma/client";
import { trpcAssert } from "../../utils/asserts";
import * as Config from "../db/configQueries";

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
  formStructureId: z.string(),
});

export type ApplicationForReview = z.infer<typeof ApplicationForReview>;

interface FormItemAndAnswer {
  formItem: {
    statement: string;
    formPosition: number;
  };
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

      const deltaHacksApplicationFormName =
        await Config.getDeltaHacksApplicationFormName(ctx.prisma);
      if (!deltaHacksApplicationFormName) {
        return [];
      }

      const application = await ctx.prisma.formSubmission.findMany({
        where: {
          formStructureId: deltaHacksApplicationFormName,
        },
        select: {
          status: true,
          formStructureId: true,
          submitter: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      try {
        return ApplicationForReview.array().parse(application);
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to parse applications.",
        });
      }
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
      const deltaHacksApplicationFormName =
        await Config.getDeltaHacksApplicationFormName(ctx.prisma);

      if (!deltaHacksApplicationFormName) {
        return null;
      }

      const formSubmission = await ctx.prisma.formSubmission.findUniqueOrThrow({
        where: {
          formStructureId_submitterId: {
            formStructureId: deltaHacksApplicationFormName,
            submitterId: input.submitterId,
          },
        },
      });

      const applicationSubmission =
        await ctx.prisma.formSubmission.findUniqueOrThrow({
          where: {
            formStructureId_submitterId: {
              formStructureId: deltaHacksApplicationFormName,
              submitterId: input.submitterId,
            },
          },
          include: {
            formStructure: {
              select: {
                formItems: {
                  include: {
                    childQuestion: {
                      include: {
                        answers: {
                          where: {
                            formSubmissionId: formSubmission.id,
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

      // Sort the questions by their positions
      applicationSubmission.formStructure.formItems.sort(
        (formItem1, formItem2) => {
          return formItem1.formPosition - formItem2.formPosition;
        }
      );

      const application: FormItemAndAnswer[] =
        applicationSubmission.formStructure.formItems.map((item) => ({
          formItem: {
            statement: item.statement,
            formPosition: item.formPosition,
          },
          answer: item.childQuestion?.answers[0]?.statement ?? null,
        }));

      return application;
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

      const deltaHacksApplicationFormName =
        await Config.getDeltaHacksApplicationFormName(ctx.prisma);

      trpcAssert(
        deltaHacksApplicationFormName,
        "NOT_FOUND",
        "No application found to update"
      );

      const formSubmission = await ctx.prisma?.formSubmission.update({
        where: {
          formStructureId_submitterId: {
            formStructureId: deltaHacksApplicationFormName,
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
