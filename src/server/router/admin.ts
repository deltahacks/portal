import { z } from "zod";
import { Role } from "@prisma/client";
import { protectedProcedure, router } from "./trpc";
import { TRPCError } from "@trpc/server";

export const adminRouter = router({
  setKillSwitch: protectedProcedure
    .input(z.boolean())
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session.user.role.includes(Role.ADMIN)) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      await ctx.prisma.config.upsert({
        where: { name: "killApplications" },
        update: { value: JSON.stringify(input) },
        create: { name: "killApplications", value: JSON.stringify(input) },
      });
    }),
});
