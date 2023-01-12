import * as trpc from "@trpc/server";
import { createProtectedRouter } from "./context";
import { Role, Status, User } from "@prisma/client";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const foodRouter = createProtectedRouter()
  // this should take a qr code value as an input and return how many meals they have taken and when they last took it
  .query("getFood", {
    input: z.number(),
    async resolve({ ctx, input }) {
      if (
        !(
          ctx.session.user.role.includes(Role.ADMIN) ||
          ctx.session.user.role.includes(Role.FOOD_MANAGER)
        )
      ) {
        throw new trpc.TRPCError({ code: "UNAUTHORIZED" });
      }
      const user = await ctx.prisma.user.findFirst({
        where: { qrcode: input },
      });

      if (user === null || user === undefined) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return { lastMeal: user.lastMealTaken, mealsTaken: user.mealsTaken };
    },
  });
