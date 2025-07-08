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
  setDhYear: protectedProcedure
    .input(z.string().regex(/^DH\d{1,2}$/))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session.user.role.includes(Role.ADMIN)) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      return await ctx.prisma.config.upsert({
        where: { name: "dhYear" },
        update: { value: input },
        create: { name: "dhYear", value: input },
      });
    }),

  getConfig: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.session.user.role.includes(Role.ADMIN)) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    const configs = await ctx.prisma.config.findMany({
      where: {
        name: {
          in: ["dhYear", "killApplications"],
        },
      },
    });

    return {
      dhYear: configs.find((c) => c.name === "dhYear")?.value || "DH11",
      killApplications: JSON.parse(
        configs.find((c) => c.name === "killApplications")?.value || "false",
      ),
    };
  }),

  getDhYear: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.session.user.role.includes(Role.ADMIN)) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    const dhYearConfig = await ctx.prisma.config.findUnique({
      where: {
        name: "dhYear",
      },
    });

    if (!dhYearConfig?.value) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "DH Year configuration not found",
      });
    }

    return dhYearConfig.value;
  }),
});
