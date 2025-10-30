import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "./trpc";
import { Role, Status } from "@prisma/client";
import { z } from "zod";

export const scannerRouter = router({
  scan: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        task: z.enum(["checkIn"]),
      })
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
      if (input.task === "checkIn") {
        await ctx.prisma.user.update({
          where: { id: input.id },
          data: { status: Status.CHECKED_IN },
        });
      }
      return { id: input.id };
    }),
});
