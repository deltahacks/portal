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

      const reviewCounts = await ctx.prisma.dH11Review.groupBy({
        by: ["applicationId"],
        _count: {
          applicationId: true,
        },
      });

      const reviewCountMap = reviewCounts.reduce((acc, curr) => {
        acc[curr.applicationId] = curr._count.applicationId;
        return acc;
      }, {} as Record<string, number>);

      const applicationsWithReviewCount = parsed.map((application) => ({
        ...application,
        reviewCount: reviewCountMap[application.DH11ApplicationId] || 0,
      }));

      return applicationsWithReviewCount;
    }),

  getApplication: protectedProcedure
    .input(
      z.object({
        dh11ApplicationId: z.string().optional(),
        includeHasReviewed: z.boolean().optional(),
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

      if (input.includeHasReviewed) {
        const review = await ctx.prisma.dH11Review.findFirst({
          where: {
            applicationId: input.dh11ApplicationId,
            reviewerId: ctx.session.user.id,
          },
        });
        return ApplicationSchemaWithStringDates.merge(
          z.object({
            hasReviewed: z.boolean(),
          })
        ).parse({
          ...applicationWithStringDates,
          hasReviewed: !!review,
        });
      }

      return ApplicationSchemaWithStringDates.parse(applicationWithStringDates);
    }),

  getStatus: protectedProcedure
    .input(
      z.object({
        id: z.string().cuid().optional(),
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

      const user = await ctx.prisma.user.findFirst({
        where: {
          id: {
            equals: input.id,
          },
        },
        select: {
          status: true,
        },
      });

      return { status: z.nativeEnum(Status).parse(user?.status) };
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
        description: `${ctx.session.user.name} changed ${user.name}'s status to ${input.status}`,
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
  // submit: protectedProcedure
  //   .input(z.object({ mark: z.number(), hackerId: z.string() }))
  //   .mutation(async ({ ctx, input }) => {
  //     if (
  //       !(
  //         ctx.session.user.role.includes(Role.ADMIN) ||
  //         ctx.session.user.role.includes(Role.REVIEWER)
  //       )
  //     ) {
  //       throw new TRPCError({ code: "UNAUTHORIZED" });
  //     }

  //     // count reviews for a hacker.
  //     // if we have 3 already, deny making any more reviews
  //     const reviewCount = await ctx.prisma.review.count({
  //       where: {
  //         hackerId: input.hackerId,
  //       },
  //     });
  //     if (reviewCount >= 3) {
  //       throw new TRPCError({ code: "CONFLICT" });
  //     }

  //     const res = await ctx.prisma.review.findFirst({
  //       where: {
  //         hackerId: input.hackerId,
  //         reviewerId: ctx.session.user.id,
  //       },
  //     });
  //     if (res) {
  //       throw new TRPCError({ code: "CONFLICT", message: "Duplicate Review" });
  //     }
  //     await ctx.prisma.review.create({
  //       data: {
  //         hackerId: input.hackerId,
  //         reviewerId: ctx.session.user.id,
  //         mark: input.mark,
  //       },
  //     });
  //   }),

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
          code: "FORBIDDEN",
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
          reviewer: ctx.session.user.email ?? "",
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

      // Fetch reviews
      const reviews = await ctx.prisma.dH11Review.findMany({
        where: { applicationId: input.applicationId },
        include: { reviewer: true },
      });

      if (!reviews.length) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No reviews found for this application",
        });
      }

      return reviews;
    }),
});
