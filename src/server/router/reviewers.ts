import { z } from "zod";
import { protectedProcedure, router } from "./trpc";
import { TRPCError } from "@trpc/server";
import { Role, Status } from "@prisma/client";
import ApplicationSchema from "../../schemas/application";

// NOTE: Prefaults
// In Zod, setting a default value will short-circuit the parsing process. If the input is undefined, the default value is eagerly returned. As such, the default value must be assignable to the output type of the schema.
// Sometimes, it's useful to define a prefault ("pre-parse default") value. If the input is undefined, the prefault value will be parsed instead. The parsing process is not short circuited. As such, the prefault value must be assignable to the input type of the schema.

const ApplicationForReview = z.object({
  id: z.cuid(),
  name: z.string(),
  email: z
    .string()
    .nullable()
    .transform((v) => (v === null ? "" : v)),
  // DH12ApplicationId: z.cuid(),
  DH13ApplicationId: z.cuid(),
  // DH12ApplicationId: z.cuid(),
  DH13ApplicationId: z.cuid(),
  applicationNumber: z.number(),
  status: z.enum(Status),
  reviewCount: z.number().prefault(0),
  avgScore: z.number().prefault(-1),
});
export type ApplicationForReview = z.infer<typeof ApplicationForReview>;

const ApplicationSchemaWithStringDates = ApplicationSchema.extend(
  z.object({
    birthday: z.string(),
    studyExpectedGraduation: z.string().nullish(),
  }).shape,
);
export type ApplicationSchemaWithStringDates = z.infer<
  typeof ApplicationSchemaWithStringDates
>;

const ReviewScoreSchema = z.object({
  applicationId: z.cuid(),
  score: z.number().min(0).max(17),
  comment: z.string(),
});

const ReviewWithReviewerSchema = z.object({
  id: z.cuid(),
  score: z.number(),
  comment: z.string(),
  reviewerId: z.string(),
  applicationId: z.string(),
  reviewer: z.object({
    id: z.string(),
    name: z.string(),
    email: z.string().nullable(),
  }),
});

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
          DH13ApplicationId: {
          DH13ApplicationId: {
            not: null,
          },
        },
        select: {
          id: true,
          name: true,
          email: true,
          DH13ApplicationId: true,
          DH13Application: {
          DH13ApplicationId: true,
          DH13Application: {
            select: {
              status: true,
              applicationNumber: true,
            },
          },
        },
      });

      const parsed = ApplicationForReview.array().parse(
        users.flatMap(({ DH13Application, ...user }) =>
          DH13Application === null
        users.flatMap(({ DH13Application, ...user }) =>
          DH13Application === null
            ? []
            : [
                {
                  ...user,
                  status: DH13Application.status,
                },
              ],
        ),
      );

      // add review counts
      const reviewStats = await ctx.prisma.dH13Review.groupBy({
      const reviewStats = await ctx.prisma.dH13Review.groupBy({
        by: ["applicationId"],
        _count: {
          applicationId: true,
        },
        _avg: {
          score: true,
        },
      });

      const reviewStatsMap = reviewStats.reduce(
        (acc, curr) => {
          acc[curr.applicationId] = {
            reviewCount: curr._count.applicationId,
            avgScore: curr._avg.score ?? 0,
          };
          return acc;
        },
        {} as Record<string, { reviewCount: number; avgScore: number }>,
      );

      const applicationsWithReviewCount = parsed.map((application) => ({
        ...application,
        reviewCount:
          reviewStatsMap[application.DH13ApplicationId]?.reviewCount || 0,
        avgScore: reviewStatsMap[application.DH13ApplicationId]?.avgScore || 0,
          reviewStatsMap[application.DH13ApplicationId]?.reviewCount || 0,
        avgScore: reviewStatsMap[application.DH13ApplicationId]?.avgScore || 0,
      }));

      return applicationsWithReviewCount;
    }),

  getApplication: protectedProcedure
    .input(
      z.object({
        dh13ApplicationId: z.string().optional(),
        dh13ApplicationId: z.string().optional(),
      }),
    )
    .output(
      ApplicationSchemaWithStringDates.extend(
        z.object({
          hasReviewed: z.boolean().optional(),
        }).shape,
      ),
    )
    .query(async ({ ctx, input }) => {
      if (
        !(
          ctx.session.user.role.includes(Role.ADMIN) ||
          ctx.session.user.role.includes(Role.REVIEWER)
        )
      ) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const application = await ctx.prisma.dH13Application.findFirst({
      const application = await ctx.prisma.dH13Application.findFirst({
        where: {
          id: {
            equals: input.dh13ApplicationId,
            equals: input.dh13ApplicationId,
          },
        },
      });

      const applicationWithStringDates = {
        ...application,
        birthday: application?.birthday.toISOString().substring(0, 10) ?? "",
        studyExpectedGraduation: application?.studyExpectedGraduation
          ?.toISOString()
          .substring(0, 10),
      };

      const review = await ctx.prisma.dH13Review.findFirst({
      const review = await ctx.prisma.dH13Review.findFirst({
        where: {
          applicationId: input.dh13ApplicationId,
          applicationId: input.dh13ApplicationId,
          reviewerId: ctx.session.user.id,
        },
      });
      return ApplicationSchemaWithStringDates.extend(
        z.object({
          hasReviewed: z.boolean(),
        }).shape,
      ).parse({
        ...applicationWithStringDates,
        hasReviewed: !!review,
      });
    }),

  getStatus: protectedProcedure
    .input(
      z.object({
        dh13ApplicationId: z.cuid(),
        dh13ApplicationId: z.cuid(),
      }),
    )
    .output(z.object({ status: z.enum(Status) }))
    .query(async ({ ctx, input }) => {
      if (
        !(
          ctx.session.user.role.includes(Role.ADMIN) ||
          ctx.session.user.role.includes(Role.REVIEWER)
        )
      ) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const application = await ctx.prisma.dH13Application.findFirst({
      const application = await ctx.prisma.dH13Application.findFirst({
        where: {
          id: input.dh13ApplicationId,
          id: input.dh13ApplicationId,
        },
        include: {
          User: true,
        },
      });

      if (!application) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Application not found",
        });
      }

      return { status: application.status };
    }),

  updateStatus: protectedProcedure
    .input(
      z.object({
        dh13ApplicationId: z.cuid(),
        dh13ApplicationId: z.cuid(),
        status: z.enum(Status),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session.user.role.includes(Role.ADMIN)) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const application = await ctx.prisma.dH13Application.update({
        where: { id: input.dh13ApplicationId },
      const application = await ctx.prisma.dH13Application.update({
        where: { id: input.dh13ApplicationId },
        data: {
          status: input.status,
        },
        include: {
          User: true,
        },
      });

      await ctx.logsnag.track({
        channel: "reviews",
        event: "Status Changed",
        user_id: `${application.User?.name ?? "Unknown"} - ${
          application.User?.email ?? "No email"
        }`,
        description: `${ctx.session.user.name} changed application status to ${input.status}`,
        tags: {
          status: input.status,
          reviewer: ctx.session.user.email ?? "",
        },
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

  submitScore: protectedProcedure
    .input(ReviewScoreSchema)
    .mutation(async ({ ctx, input }) => {
      // Check authorization
      if (
        !(
          ctx.session.user.role.includes(Role.ADMIN) ||
          ctx.session.user.role.includes(Role.REVIEWER)
        )
      ) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      // Get application
      const application = await ctx.prisma.dH13Application.findFirst({
      const application = await ctx.prisma.dH13Application.findFirst({
        where: {
          id: input.applicationId,
        },
        include: { User: true },
      });

      if (!application) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Application not found",
        });
      }

      // Check if reviewer already scored this application
      const existingReview = await ctx.prisma.dH13Review.findFirst({
      const existingReview = await ctx.prisma.dH13Review.findFirst({
        where: {
          applicationId: input.applicationId,
          reviewerId: ctx.session.user.id,
        },
      });
      if (existingReview) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "You have already reviewed this application",
        });
      }

      // Create new review
      const review = await ctx.prisma.dH13Review.create({
      const review = await ctx.prisma.dH13Review.create({
        data: {
          applicationId: input.applicationId,
          reviewerId: ctx.session.user.id,
          score: input.score,
          comment: input.comment,
        },
      });

      // Log review
      await ctx.logsnag.track({
        channel: "reviews",
        event: "Application Scored",
        user_id: `${application.User?.name ?? "Unknown"} - ${
          application.User?.email ?? "No email"
        }`,
        description: `${ctx.session.user.name} scored application with ${input.score}/17`,
        tags: {
          score: input.score.toString(),
          reviewer: ctx.session.user.email ?? ctx.session.user.id,
          feedback: input.comment ?? "No feedback provided",
        },
        icon: "📝",
      });

      return review;
    }),

  getReviewsForApplication: protectedProcedure
    .input(z.object({ applicationId: z.cuid() }))
    .output(ReviewWithReviewerSchema.array())
    .query(async ({ ctx, input }) => {
      // Check authorization
      if (
        !(
          ctx.session.user.role.includes(Role.ADMIN) ||
          ctx.session.user.role.includes(Role.REVIEWER)
        )
      ) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      // Fetch reviews
      const reviews = await ctx.prisma.dH13Review.findMany({
      const reviews = await ctx.prisma.dH13Review.findMany({
        where: { applicationId: input.applicationId },
        include: { reviewer: true },
      });

      return ReviewWithReviewerSchema.array().parse(reviews);
    }),

  updateApplicationStatusByScoreRange: protectedProcedure
    .input(
      z.object({
        status: z.enum([
          Status.ACCEPTED,
          Status.REJECTED,
          Status.WAITLISTED,
          Status.IN_REVIEW,
        ]),
        minRange: z.number().min(0),
        maxRange: z.number().max(17),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session.user.role.includes(Role.ADMIN)) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const users = await ctx.prisma.user.findMany({
        where: {
          DH13ApplicationId: {
          DH13ApplicationId: {
            not: null,
          },
        },
        select: {
          id: true,
          name: true,
          email: true,
          DH13ApplicationId: true,
          DH13Application: {
          DH13ApplicationId: true,
          DH13Application: {
            select: {
              status: true,
              applicationNumber: true,
            },
          },
        },
      });

      const parsed = ApplicationForReview.array().parse(
        users.flatMap(({ DH13Application, ...user }) =>
          DH13Application === null
        users.flatMap(({ DH13Application, ...user }) =>
          DH13Application === null
            ? []
            : [
                {
                  ...user,
                  status: DH13Application.status,
                },
              ],
        ),
      );

      // add review counts
      const reviewStats = await ctx.prisma.dH13Review.groupBy({
      const reviewStats = await ctx.prisma.dH13Review.groupBy({
        by: ["applicationId"],
        _count: {
          applicationId: true,
        },
        _avg: {
          score: true,
        },
      });

      const reviewStatsMap = reviewStats.reduce(
        (acc, curr) => {
          acc[curr.applicationId] = {
            reviewCount: curr._count.applicationId,
            avgScore: curr._avg.score ?? 0,
          };
          return acc;
        },
        {} as Record<string, { reviewCount: number; avgScore: number }>,
      );

      const applicationsWithReviewCount = parsed.map((application) => ({
        ...application,
        reviewCount:
          reviewStatsMap[application.DH13ApplicationId]?.reviewCount || 0,
        avgScore: reviewStatsMap[application.DH13ApplicationId]?.avgScore || 0,
          reviewStatsMap[application.DH13ApplicationId]?.reviewCount || 0,
        avgScore: reviewStatsMap[application.DH13ApplicationId]?.avgScore || 0,
      }));

      const applicationsToUpdate = applicationsWithReviewCount.filter(
        (application) =>
          application.avgScore >= input.minRange &&
          application.avgScore <= input.maxRange,
      );

      // use an updateMany query to update all application statuses
      await ctx.prisma.dH13Application.updateMany({
      await ctx.prisma.dH13Application.updateMany({
        where: {
          id: {
            in: applicationsToUpdate.map((app) => app.DH13ApplicationId),
            in: applicationsToUpdate.map((app) => app.DH13ApplicationId),
          },
        },
        data: {
          status: input.status,
        },
      });

      // track it in logsnag
      await ctx.logsnag.track({
        channel: "status",
        event: "Status Changed",
        user_id: `${ctx.session.user.name} - ${ctx.session.user.email}`,
        description: `${ctx.session.user.name} changed application status to ${input.status} for applications with scores between ${input.minRange} and ${input.maxRange}`,
        tags: {
          status: input.status,
          reviewer: ctx.session.user.email ?? "",
        },
        icon:
          input.status === Status.ACCEPTED
            ? "✅"
            : input.status === Status.REJECTED
              ? "❌"
              : input.status === Status.WAITLISTED
                ? "🕰️"
                : input.status === Status.IN_REVIEW
                  ? "🎟️"
                  : "🤔",
      });
    }),
});
