import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "./trpc";
import { Role, Status } from "@prisma/client";
import { z } from "zod";

export const scannerRouter = router({
  scan: protectedProcedure
    .input(
      z.object({
        id: z.cuid(),
        task: z.enum(["checkIn", "food", "events"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session.user.role.includes(Role.ADMIN)) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
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
          // for food station we need entries to act as burning tokens. it should be an enum of 3-4 options for meals.
          break;
        case "events":
          // for events station we need entries to act as burning tokens. it should be an enum of 3-4 options for events.
          break;
      }

      return { id: input.id };
    }),
});
