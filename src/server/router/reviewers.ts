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
  DH11ApplicationId: z.string().cuid(),
  reviewCount: z.number().default(0),
  avgScore: z.number().default(-1),
});
export type ApplicationForReview = z.infer<typeof ApplicationForReview>;

const ApplicationSchemaWithStringDates = ApplicationSchema.merge(
  z.object({
    birthday: z.string(),
    studyExpectedGraduation: z.string().nullish(),
  }),
);
export type ApplicationSchemaWithStringDates = z.infer<
  typeof ApplicationSchemaWithStringDates
>;

const ReviewScoreSchema = z.object({
  applicationId: z.string().cuid(),
  score: z.number().min(0).max(17),
  comment: z.string(),
});

const ReviewWithReviewerSchema = z.object({
  id: z.string().cuid(),
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
          DH11ApplicationId: {
            not: null,
          },
        },
        select: {
          id: true,
          name: true,
          email: true,
          status: true,
          DH11ApplicationId: true,
        },
      });

      const parsed = ApplicationForReview.array().parse(users);

      // add review counts
      const reviewStats = await ctx.prisma.dH11Review.groupBy({
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
          reviewStatsMap[application.DH11ApplicationId]?.reviewCount || 0,
        avgScore: reviewStatsMap[application.DH11ApplicationId]?.avgScore || 0,
      }));

      return applicationsWithReviewCount;
    }),

  getApplication: protectedProcedure
    .input(
      z.object({
        dh11ApplicationId: z.string().optional(),
      }),
    )
    .output(
      ApplicationSchemaWithStringDates.merge(
        z.object({
          hasReviewed: z.boolean().optional(),
        }),
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

      const application = await ctx.prisma.dH11Application.findFirst({
        where: {
          id: {
            equals: input.dh11ApplicationId,
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

      const review = await ctx.prisma.dH11Review.findFirst({
        where: {
          applicationId: input.dh11ApplicationId,
          reviewerId: ctx.session.user.id,
        },
      });
      return ApplicationSchemaWithStringDates.merge(
        z.object({
          hasReviewed: z.boolean(),
        }),
      ).parse({
        ...applicationWithStringDates,
        hasReviewed: !!review,
      });
    }),

  getStatus: protectedProcedure
    .input(
      z.object({
        dh11ApplicationId: z.string().cuid(),
      }),
    )
    .output(z.object({ status: z.nativeEnum(Status) }))
    .query(async ({ ctx, input }) => {
      if (
        !(
          ctx.session.user.role.includes(Role.ADMIN) ||
          ctx.session.user.role.includes(Role.REVIEWER)
        )
      ) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const application = await ctx.prisma.dH11Application.findFirst({
        where: {
          id: input.dh11ApplicationId,
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
        dh11ApplicationId: z.string().cuid(),
        status: z.nativeEnum(Status),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session.user.role.includes(Role.ADMIN)) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const application = await ctx.prisma.dH11Application.update({
        where: { id: input.dh11ApplicationId },
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
      const application = await ctx.prisma.dH11Application.findFirst({
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
      const existingReview = await ctx.prisma.dH11Review.findFirst({
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
      const review = await ctx.prisma.dH11Review.create({
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
    .input(z.object({ applicationId: z.string().cuid() }))
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
      const reviews = await ctx.prisma.dH11Review.findMany({
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
          DH11ApplicationId: {
            not: null,
          },
        },
        select: {
          id: true,
          name: true,
          email: true,
          status: true,
          DH11ApplicationId: true,
        },
      });

      const parsed = ApplicationForReview.array().parse(users);

      // add review counts
      const reviewStats = await ctx.prisma.dH11Review.groupBy({
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
          reviewStatsMap[application.DH11ApplicationId]?.reviewCount || 0,
        avgScore: reviewStatsMap[application.DH11ApplicationId]?.avgScore || 0,
      }));

      const applicationsToUpdate = applicationsWithReviewCount.filter(
        (application) =>
          application.avgScore >= input.minRange &&
          application.avgScore <= input.maxRange,
      );

      // use an updateMany query to update all application statuses
      await ctx.prisma.dH11Application.updateMany({
        where: {
          id: {
            in: applicationsToUpdate.map((app) => app.DH11ApplicationId),
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
