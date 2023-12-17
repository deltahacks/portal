import { z } from "zod";
import { protectedProcedure, router } from "./trpc";
import { TRPCError } from "@trpc/server";
import { Role, Status } from "@prisma/client";
import ApplicationSchema from "../../schemas/application";

const ApplicationForReview = z.object({
  id: z.string().cuid(),
  name: z.string(),
  email: z
    .string()
    .nullable()
    .transform((v) => (v === null ? "" : v)),
  status: z.nativeEnum(Status),
  dH10ApplicationId: z.string().cuid(),
});

export type ApplicationForReview = z.infer<typeof ApplicationForReview>;

export const reviewerRouter = router({
  getApplications: protectedProcedure
    .output(ApplicationForReview.array())
    .query(async ({ ctx }) => {
      if (
        !(
          ctx.session.user.role.includes(Role.ADMIN) ||
          ctx.session.user.role.includes(Role.REVIEWER)
        )
      ) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const users = await ctx.prisma.user.findMany({
        where: {
          dH10ApplicationId: {
            not: null,
          },
        },
        select: {
          id: true,
          name: true,
          email: true,
          status: true,
          dH10ApplicationId: true,
        },
      });

      const parsed = ApplicationForReview.array().parse(users);

      return parsed;
    }),
  getApplication: protectedProcedure
    .input(
      z.object({
        dH10ApplicationId: z.string().optional(),
      })
    )
    .output(ApplicationSchema)
    .query(async ({ ctx, input }) => {
      if (
        !(
          ctx.session.user.role.includes(Role.ADMIN) ||
          ctx.session.user.role.includes(Role.REVIEWER)
        )
      ) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const application = await ctx.prisma.dH10Application.findFirst({
        where: {
          id: {
            equals: input.dH10ApplicationId,
          },
        },
      });

      return ApplicationSchema.parse(application);
    }),
  updateStatus: protectedProcedure
    .input(
      z.object({
        id: z.string().cuid().optional(),
        status: z.nativeEnum(Status),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (
        !(
          ctx.session.user.role.includes(Role.ADMIN) ||
          ctx.session.user.role.includes(Role.REVIEWER)
        )
      ) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const user = await ctx.prisma.user.update({
        where: { id: input.id },
        data: {
          status: input.status,
        },
      });
      await ctx.logsnag.track({
        channel: "reviews",
        event: "Status Changed",
        user_id: `${user.name} - ${user.email}`,
        description: `${ctx.session.user.name} (${ctx.session.user.email}) changed ${user.name}'s status to ${input.status}`,
        tags: { status: input.status },
        icon:
          input.status === Status.ACCEPTED
            ? "✅"
            : input.status === Status.REJECTED
            ? "❌"
            : input.status === Status.WAITLISTED
            ? "🕰️"
            : input.status === Status.RSVP
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
