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
  applicationId: z.string().cuid(), // Changed from DH11ApplicationId
  reviewCount: z.number().default(0),
  avgScore: z.number().default(-1),
});
export type ApplicationForReview = z.infer<typeof ApplicationForReview>;

const ApplicationSchemaWithStringDates = ApplicationSchema.merge(
  z.object({
    birthday: z.string(),
    studyExpectedGraduation: z.string().nullish(),
  })
);
export type ApplicationSchemaWithStringDates = z.infer<
  typeof ApplicationSchemaWithStringDates
>;

const ReviewScoreSchema = z.object({
  applicationId: z.string().cuid(),
  score: z.number().min(0).max(17),
  comment: z.string(),
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
          DH12ApplicationId: { // Changed to DH12ApplicationId
            not: null,
          },
        },
        select: {
          id: true,
          name: true,
          email: true,
          status: true, // This is User.status, might need Application.status
          DH12ApplicationId: true, // Fetch DH12ApplicationId
        },
      });

      // Map users to ApplicationForReview, renaming DH12ApplicationId to applicationId
      const applicationsForReview = users.map(user => ({
        id: user.id, // This is User.id, might need Application.id depending on usage
        name: user.name ?? "N/A",
        email: user.email ?? "",
        status: user.status, // This is User.status. Ideally, it should be Application.status
        applicationId: user.DH12ApplicationId!, // Assert non-null as per where clause
      }));
      
      const parsed = ApplicationForReview.array().parse(applicationsForReview.map(app => ({...app, reviewCount: 0, avgScore: -1 })));


      // Add review counts from dH12Review
      const reviewStats = await ctx.prisma.dH12Review.groupBy({ // Changed to dH12Review
        by: ["applicationId"],
        _count: {
          applicationId: true,
        },
        _avg: {
          score: true,
        },
      });

      const reviewStatsMap = reviewStats.reduce((acc, curr) => {
        acc[curr.applicationId] = {
          reviewCount: curr._count.applicationId,
          avgScore: curr._avg.score ?? 0,
        };
        return acc;
      }, {} as Record<string, { reviewCount: number; avgScore: number }>);

      const applicationsWithReviewCount = parsed.map((application) => ({
        ...application,
        // The status here is from User model, ideally we want application's status.
        // This requires fetching the actual DH12Application or joining.
        // For now, keeping User.status as placeholder.
        reviewCount:
          reviewStatsMap[application.applicationId]?.reviewCount || 0,
        avgScore: reviewStatsMap[application.applicationId]?.avgScore || 0,
      }));

      return applicationsWithReviewCount;
    }),

  getApplication: protectedProcedure
    .input(
      z.object({
        applicationId: z.string().optional(), // Changed from dh11ApplicationId
      })
    )
    .output(
      ApplicationSchemaWithStringDates.merge(
        z.object({
          hasReviewed: z.boolean().optional(),
        })
      )
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

      let application: any = null; // Type will be dH12Application or dH11Application
      let reviewTable: "dH12Review" | "dH11Review" | null = null;

      if (input.applicationId) {
        application = await ctx.prisma.dH12Application.findUnique({
          where: { id: input.applicationId },
        });
        if (application) {
          reviewTable = "dH12Review";
        } else {
          application = await ctx.prisma.dH11Application.findUnique({
            where: { id: input.applicationId },
          });
          if (application) {
            reviewTable = "dH11Review";
          }
        }
      }

      if (!application) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Application not found." });
      }

      const applicationWithStringDates = {
        ...application,
        birthday: application.birthday.toISOString().substring(0, 10) ?? "",
        studyExpectedGraduation: application.studyExpectedGraduation
          ?.toISOString()
          .substring(0, 10),
      };

      let hasReviewed = false;
      if (reviewTable && input.applicationId) {
        const review = await ctx.prisma[reviewTable].findFirst({
          where: {
            applicationId: input.applicationId,
            reviewerId: ctx.session.user.id,
          },
        });
        hasReviewed = !!review;
      }
      
      return ApplicationSchemaWithStringDates.merge(
        z.object({
          hasReviewed: z.boolean(),
        })
      ).parse({
        ...applicationWithStringDates,
        hasReviewed: hasReviewed,
      });
    }),

  getStatus: protectedProcedure
    .input(
      z.object({
        applicationId: z.string().cuid(), // Changed from dh11ApplicationId
      })
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

      let application: any = null;
      if (input.applicationId) {
        application = await ctx.prisma.dH12Application.findUnique({
          where: { id: input.applicationId },
          include: { User: true }
        });
        if (!application) {
          application = await ctx.prisma.dH11Application.findUnique({
            where: { id: input.applicationId },
            include: { User: true }
          });
        }
      }

      if (!application) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Application not found",
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
        applicationId: z.string().cuid(), // Changed from dh11ApplicationId
        status: z.nativeEnum(Status),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session.user.role.includes(Role.ADMIN)) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      let application: any = null;
      let appType : "dH12Application" | "dH11Application" | null = null;

      // Try to find and update DH12 first
      const dh12App = await ctx.prisma.dH12Application.findUnique({ where: { id: input.applicationId }});
      if (dh12App) {
        application = await ctx.prisma.dH12Application.update({
          where: { id: input.applicationId },
          data: { status: input.status },
          include: { User: true },
        });
        appType = "dH12Application";
      } else {
        // Fallback to DH11
        const dh11App = await ctx.prisma.dH11Application.findUnique({ where: { id: input.applicationId }});
        if (dh11App) {
          application = await ctx.prisma.dH11Application.update({
            where: { id: input.applicationId },
            data: { status: input.status },
            include: { User: true },
          });
          appType = "dH11Application";
        }
      }
      
      if (!application) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Application not found to update." });
      }

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

      // Get application to determine its type (DH11 or DH12)
      let application: any = await ctx.prisma.dH12Application.findUnique({ // any type for now
        where: { id: input.applicationId },
        include: { User: true },
      });
      let reviewTable: "dH12Review" | "dH11Review" = "dH12Review";

      if (!application) {
        application = await ctx.prisma.dH11Application.findUnique({
          where: { id: input.applicationId },
          include: { User: true },
        });
        if (application) {
          reviewTable = "dH11Review";
        }
      }
      
      if (!application) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Application not found",
        });
      }

      // Check if reviewer already scored this application in the correct table
      const existingReview = await ctx.prisma[reviewTable].findFirst({
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

      // Create new review in the correct table
      const review = await ctx.prisma[reviewTable].create({
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

      // Fetch reviews from the correct table
      let reviews: any[] = []; // Define type more accurately if possible
      const dh12App = await ctx.prisma.dH12Application.findUnique({ where: {id: input.applicationId }});
      if (dh12App) {
        reviews = await ctx.prisma.dH12Review.findMany({
          where: { applicationId: input.applicationId },
          include: { reviewer: true },
        });
      } else {
        const dh11App = await ctx.prisma.dH11Application.findUnique({ where: {id: input.applicationId }});
        if (dh11App) {
          reviews = await ctx.prisma.dH11Review.findMany({
            where: { applicationId: input.applicationId },
            include: { reviewer: true },
          });
        } else {
            throw new TRPCError({ code: "NOT_FOUND", message: "Application not found to fetch reviews for." });
        }
      }
      
      return reviews;
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
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session.user.role.includes(Role.ADMIN)) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const users = await ctx.prisma.user.findMany({
        where: {
          DH12ApplicationId: { // Target DH12 applications
            not: null,
          },
        },
        select: {
          id: true,
          name: true,
          email: true,
          status: true, // User status
          DH12ApplicationId: true,
        },
      });
      
      // Map to a structure that fits ApplicationForReview (with applicationId)
      const applicationsForReview = users.map(user => ({
        id: user.id, // User ID
        name: user.name ?? "N/A",
        email: user.email ?? "",
        status: user.status, // User status, ideally should be application status
        applicationId: user.DH12ApplicationId!,
      }));

      const parsed = ApplicationForReview.array().parse(applicationsForReview.map(app => ({...app, reviewCount: 0, avgScore: -1 })));

      // Add review counts from dH12Review
      const reviewStats = await ctx.prisma.dH12Review.groupBy({ // Use dH12Review
        by: ["applicationId"],
        _count: {
          applicationId: true,
        },
        _avg: {
          score: true,
        },
      });

      const reviewStatsMap = reviewStats.reduce((acc, curr) => {
        acc[curr.applicationId] = {
          reviewCount: curr._count.applicationId,
          avgScore: curr._avg.score ?? 0,
        };
        return acc;
      }, {} as Record<string, { reviewCount: number; avgScore: number }>);

      const applicationsWithReviewCount = parsed.map((application) => ({
        ...application,
        reviewCount:
          reviewStatsMap[application.applicationId]?.reviewCount || 0,
        avgScore: reviewStatsMap[application.applicationId]?.avgScore || 0,
      }));

      const applicationsToUpdate = applicationsWithReviewCount.filter(
        (application) =>
          application.avgScore >= input.minRange &&
          application.avgScore <= input.maxRange
      );

      // use an updateMany query to update all dH12Application statuses
      await ctx.prisma.dH12Application.updateMany({ // Target dH12Application
        where: {
          id: {
            in: applicationsToUpdate.map((app) => app.applicationId), // Use generic applicationId
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
