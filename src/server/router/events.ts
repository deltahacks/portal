import { createProtectedRouter } from "./context";
import * as trpc from "@trpc/server";
import { Role, Status, User } from "@prisma/client";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { resolve } from "path";

export const eventsRouter = createProtectedRouter().mutation("checkin", {
  input: z.object({
    qrcode: z.number(),
    eventName: z.string(),
  }),
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
      where: { qrcode: input.qrcode },
    });

    if (user === null || user === undefined) {
      throw new TRPCError({ code: "NOT_FOUND" });
    }
    const currentTime = new Date();
    await ctx.prisma.eventLog.create({
      data: {
        id: ctx.session.user.id,
        userId: user.id,
        timestamp: currentTime,
        event: input.eventName,
      },
    });
  },
});
