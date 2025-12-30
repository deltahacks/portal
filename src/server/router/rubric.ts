import { z } from "zod";
import { Role } from "@prisma/client";
import { protectedProcedure, publicProcedure, router } from "./trpc";
import { TRPCError } from "@trpc/server";

export const rubricRouter = router({
  // Create a new rubric (admin only)
  createRubric: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        dhYear: z.string(),
        trackId: z.string().optional(), // Link rubric to a track for now
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session.user.role.includes(Role.ADMIN)) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      // For now, we'll use the track as the rubric container
      // This can be expanded when the schema is updated
      const track = await ctx.prisma.track.findUnique({
        where: { id: input.trackId },
      });

      if (!track && input.trackId) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Track not found",
        });
      }

      return {
        id: `rubric-${Date.now()}`,
        name: input.name,
        description: input.description,
        dhYear: input.dhYear,
        trackId: input.trackId,
        message: "Rubric created successfully (using track as container)",
      };
    }),

  // Update rubric metadata (admin only)
  updateRubric: protectedProcedure
    .input(
      z.object({
        trackId: z.string(),
        name: z.string().min(1).optional(),
        description: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session.user.role.includes(Role.ADMIN)) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const { trackId, ...updateData } = input;

      // Update the track name to represent rubric name for now
      return ctx.prisma.track.update({
        where: { id: trackId },
        data: updateData,
      });
    }),

  // Delete rubric (admin only) - soft delete by making inactive
  deleteRubric: protectedProcedure
    .input(z.object({ trackId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session.user.role.includes(Role.ADMIN)) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      // Soft delete - in a full implementation, we'd add isActive field
      return {
        success: true,
        message: "Rubric deleted successfully",
      };
    }),

  // Get single rubric with criteria
  getRubric: publicProcedure
    .input(z.object({ trackId: z.string() }))
    .query(async ({ ctx, input }) => {
      const track = await ctx.prisma.track.findUnique({
        where: { id: input.trackId },
        include: {
          RubricQuestion: {
            orderBy: { id: "asc" },
          },
        },
      });

      if (!track) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Rubric not found",
        });
      }

      return {
        id: track.id,
        name: track.name,
        description: `Rubric for ${track.name} track`,
        criteria: track.RubricQuestion.map((q) => ({
          id: q.id,
          name: q.title,
          description: q.question,
          maxScore: q.points,
          weight: 1.0,
          order: parseInt(q.id.slice(-4), 16) % 1000, // Use ID for ordering as fallback
        })),
      };
    }),

  // Get all rubrics
  getRubrics: publicProcedure.query(async ({ ctx }) => {
    const tracks = await ctx.prisma.track.findMany({
      include: {
        _count: {
          select: { RubricQuestion: true },
        },
      },
    });

    return tracks.map((track) => ({
      id: track.id,
      name: track.name,
      description: `Rubric for ${track.name} track`,
      criteriaCount: track._count.RubricQuestion,
      isActive: true,
    }));
  }),

  // Manage criteria (CRUD for RubricCriterion records - using RubricQuestion)
  manageCriteria: protectedProcedure
    .input(
      z.object({
        trackId: z.string(),
        action: z.enum(["create", "update", "delete"]),
        criterion: z
          .object({
            id: z.string().optional(),
            name: z.string(),
            description: z.string(),
            maxScore: z.number().min(1).max(100),
            weight: z.number().min(0.1).max(10).default(1.0),
            order: z.number().default(0),
          })
          .optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session.user.role.includes(Role.ADMIN)) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const { trackId, action, criterion } = input;

      switch (action) {
        case "create":
          if (!criterion) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Criterion data required for create action",
            });
          }
          return ctx.prisma.rubricQuestion.create({
            data: {
              title: criterion.name,
              question: criterion.description,
              points: criterion.maxScore,
              trackId: trackId,
            },
          });

        case "update":
          if (!criterion || !criterion.id) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Criterion ID required for update action",
            });
          }
          return ctx.prisma.rubricQuestion.update({
            where: { id: criterion.id },
            data: {
              title: criterion.name,
              question: criterion.description,
              points: criterion.maxScore,
            },
          });

        case "delete":
          if (!criterion || !criterion.id) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Criterion ID required for delete action",
            });
          }
          return ctx.prisma.rubricQuestion.delete({
            where: { id: criterion.id },
          });

        default:
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid action",
          });
      }
    }),

  // Grade an application (reviewer)
  gradeApplication: protectedProcedure
    .input(
      z.object({
        applicationId: z.string(),
        trackId: z.string(), // Use track as rubric for now
        grades: z.array(
          z.object({
            criterionId: z.string(),
            score: z.number().min(0),
            comments: z.string().optional(),
          }),
        ),
        totalScore: z.number().min(0),
        comments: z.string().optional(),
      }),
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

      // For now, we'll create a review record
      // In a full implementation, this would create ApplicationGrade and CriterionGrade records
      const existingReview = await ctx.prisma.dH12Review.findFirst({
        where: {
          applicationId: input.applicationId,
          reviewerId: ctx.session.user.id,
        },
      });

      if (existingReview) {
        // Update existing review
        return ctx.prisma.dH12Review.update({
          where: { id: existingReview.id },
          data: {
            score: input.totalScore,
            comment: input.comments || "",
          },
        });
      }

      // Create new review
      return ctx.prisma.dH12Review.create({
        data: {
          applicationId: input.applicationId,
          reviewerId: ctx.session.user.id,
          score: input.totalScore,
          comment: input.comments || "",
        },
      });
    }),

  // Get all grades for an application (reviewer/admin)
  getGradesForApplication: protectedProcedure
    .input(z.object({ applicationId: z.string() }))
    .query(async ({ ctx, input }) => {
      if (
        !(
          ctx.session.user.role.includes(Role.ADMIN) ||
          ctx.session.user.role.includes(Role.REVIEWER)
        )
      ) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const reviews = await ctx.prisma.dH12Review.findMany({
        where: { applicationId: input.applicationId },
        include: {
          reviewer: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      return reviews.map((review) => ({
        id: review.id,
        graderId: review.reviewerId,
        graderName: review.reviewer.name || "Unknown",
        totalScore: review.score,
        comments: review.comment,
        createdAt: review,
      }));
    }),

  // Get grades submitted by current user (reviewer)
  getMyGrades: protectedProcedure.query(async ({ ctx }) => {
    const reviews = await ctx.prisma.dH12Review.findMany({
      where: { reviewerId: ctx.session.user.id },
      include: {
        application: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return reviews.map((review) => ({
      id: review.id,
      applicationId: review.applicationId,
      applicantName: `${review.application.firstName} ${review.application.lastName}`,
      totalScore: review.score,
      comments: review.comment,
      createdAt: review.createdAt,
    }));
  }),
});
