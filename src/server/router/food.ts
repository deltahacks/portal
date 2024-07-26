import { Role } from "@prisma/client";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "./trpc";

// TODO: Deprecate
export const foodRouter = router({
  getFood: protectedProcedure
    .input(z.number())
    .query(async ({ ctx, input }) => {
      if (
        !(
          ctx.session.user.role.includes(Role.ADMIN) ||
          ctx.session.user.role.includes(Role.FOOD_MANAGER)
        )
      ) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      const user = await ctx.prisma.user.findFirst({
        where: { qrcode: input },
      });

      if (user === null || user === undefined) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return { lastMeal: user.lastMealTaken, mealsTaken: user.mealsTaken };
    }),
  addFood: protectedProcedure
    .input(z.number())
    .mutation(async ({ ctx, input }) => {
      if (
        !(
          ctx.session.user.role.includes(Role.ADMIN) ||
          ctx.session.user.role.includes(Role.FOOD_MANAGER)
        )
      ) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      const user = await ctx.prisma.user.findFirst({
        where: { qrcode: input },
      });
      if (user === null || user === undefined) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      const currentTime = new Date();
      await ctx.prisma.user.update({
        where: { qrcode: input },
        data: { mealsTaken: { increment: 1 }, lastMealTaken: currentTime },
      });
    }),
  subFood: protectedProcedure
    .input(z.number())
    .mutation(async ({ ctx, input }) => {
      if (
        !(
          ctx.session.user.role.includes(Role.ADMIN) ||
          ctx.session.user.role.includes(Role.FOOD_MANAGER)
        )
      ) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      const user = await ctx.prisma.user.findFirst({
        where: { qrcode: input },
      });
      if (user === null || user === undefined) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      if (user.mealsTaken > 0) {
        await ctx.prisma.user.update({
          where: { qrcode: input },
          data: { mealsTaken: { decrement: 1 } },
        });
      }
    }),
});
