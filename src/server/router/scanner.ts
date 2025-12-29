import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "./trpc";
import { Role, Status } from "@prisma/client";
import { z } from "zod";
import { stationConfigSchema } from "../../schemas/scanner";

export const scannerRouter = router({
  scan: protectedProcedure
    .input(
      z.object({
        id: z.cuid(),
        station: stationConfigSchema,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, station } = input;
      if (!ctx.session.user.role.includes(Role.ADMIN)) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You don't have permission to perform this action.",
        });
      }
      const user = await ctx.prisma.user.findFirst({
        where: { id },
      });
      if (user === null || user === undefined) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Attendee not found. This QR code is not registered.",
        });
      }
      switch (station.name) {
        case "checkIn":
          await ctx.prisma.user.update({
            where: { id },
            data: { status: Status.CHECKED_IN },
          });
          break;
        case "food":
          // for food station we need entries to act as burning tokens. it should be an enum of 3-4 options for meals.
          await ctx.prisma.eventLog.create({
            data: {
              userId: id,
              station: station.name,
              type: station.type,
              timestamp: new Date(),
            },
          });
          break;
        case "events":
          // for events station we need entries to act as burning tokens. it should be an enum of 3-4 options for events.
          await ctx.prisma.eventLog.create({
            data: {
              userId: id,
              station: station.name,
              type: station.type,
              timestamp: new Date(),
            },
          });
          break;
      }
      const userInfo = {
        id: user.id,
        name: user.name,
        email: user.email,
      };
      return userInfo;
    }),
});
