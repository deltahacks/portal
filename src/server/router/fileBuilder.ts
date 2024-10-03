import { z } from "zod";
import { protectedProcedure, router } from "./trpc";

export const fileBuilder = router({
  createForm: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.formStructure.create({
        data: { id: input.id },
      });
    }),

  createCategory: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        formPosition: z.number(),
        formStructureId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.questionCategory.create({
        data: {
          formStructureId: input.formStructureId,
          name: input.name,
          formPosition: input.formPosition,
        },
      });
    }),

  updateCategory: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        formPosition: z.number(),
        formStructureId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.questionCategory.update({
        where: {
          name_formStructureId: {
            name: input.name,
            formStructureId: input.formStructureId,
          },
        },
        data: {
          formStructureId: input.formStructureId,
          name: input.name,
          formPosition: input.formPosition,
        },
      });
    }),

  createQuestion: protectedProcedure
    .input(
      z.object({
        statement: z.string(),
        categoryPosition: z.number(),
        categoryId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.question.create({
        data: {
          statement: input.statement,
          categoryPosition: input.categoryPosition,
          categoryId: input.categoryId,
        },
      });
    }),

  updateQuestion: protectedProcedure
    .input(
      z.object({
        statement: z.string(),
        categoryPosition: z.number(),
        categoryId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.question.update({
        where: {
          categoryPosition_categoryId: {
            categoryPosition: input.categoryPosition,
            categoryId: input.categoryId,
          },
        },
        data: {
          statement: input.statement,
          categoryPosition: input.categoryPosition,
          categoryId: input.categoryId,
        },
      });
    }),
});
