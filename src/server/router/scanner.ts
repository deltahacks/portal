import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "./trpc";
import { Role, Status } from "@prisma/client";
import { z } from "zod";

export const scannerRouter = router({
  scan: protectedProcedure
    .input(
      z.object({
        id: z.cuid(),
        task: z.enum(["checkIn", "food", "events"]), // Available tasks: checkIn (updates user status), food (meal tracking), events (event attendance)
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findFirst({
        where: { id: input.id },
      });
      if (user === null || user === undefined) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      switch (input.task) {
        case "checkIn":
          await ctx.prisma.user.update({
            where: { id: input.id },
            data: { status: Status.CHECKED_IN },
          });
          break;
        case "food":
          // TODO: Implement meal tracking - could track breakfast, lunch, dinner, snack as burning tokens
          break;
        case "events":
          // TODO: Implement event attendance tracking - could track workshop, keynote, activity, social as burning tokens
          break;
      }

      return { id: input.id };
    }),
});
