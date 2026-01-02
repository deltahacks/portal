import { TRPCError } from "@trpc/server";
import { protectedProcedure, publicProcedure, router } from "./trpc";
import { Role, Status } from "@prisma/client";
import { z } from "zod";

export const scannerRouter = router({
  listStations: publicProcedure.query(async ({ ctx }) => {
    const stations = await ctx.prisma.station.findMany({
      orderBy: [{ name: "asc" }, { option: "asc" }],
      include: { _count: { select: { eventLogs: true } } },
    });

    const grouped = stations.reduce(
      (acc, station) => {
        if (!acc[station.name]) {
          acc[station.name] = [];
        }
        acc[station.name]!.push(station);
        return acc;
      },
      {} as Record<string, typeof stations>,
    );

    return grouped;
  }),

  getStationOptions: publicProcedure
    .input(z.object({ name: z.string() }))
    .query(async ({ ctx, input }) => {
      const stations = await ctx.prisma.station.findMany({
        where: { name: input.name },
        orderBy: { option: "asc" },
      });
      return stations;
    }),

  createStation: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        option: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session.user.role.includes(Role.ADMIN)) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const existing = await ctx.prisma.station.findUnique({
        where: {
          name_option: {
            name: input.name,
            option: input.option,
          },
        },
      });

      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "This option already exists for this station",
        });
      }

      return await ctx.prisma.station.create({
        data: {
          name: input.name,
          option: input.option,
        },
      });
    }),

  updateStation: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        option: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session.user.role.includes(Role.ADMIN)) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const station = await ctx.prisma.station.findUnique({
        where: { id: input.id },
      });

      if (!station) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const existing = await ctx.prisma.station.findUnique({
        where: {
          name_option: {
            name: station.name,
            option: input.option,
          },
        },
      });

      if (existing && existing.id !== input.id) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "This option already exists for this station",
        });
      }

      return await ctx.prisma.station.update({
        where: { id: input.id },
        data: { option: input.option },
      });
    }),

  deleteStation: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session.user.role.includes(Role.ADMIN)) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      return await ctx.prisma.station.delete({
        where: { id: input.id },
      });
    }),

  scan: protectedProcedure
    .input(
      z.object({
        id: z.cuid(),
        stationId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, stationId } = input;
      const allowedRoles = [
        Role.ADMIN,
        Role.GENERAL_SCANNER,
        Role.FOOD_MANAGER,
        Role.EVENT_MANAGER,
      ];
      if (!allowedRoles.some((role) => ctx.session.user.role.includes(role))) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You don't have permission to perform this action",
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

      // Handle checkIn station separately (no station record needed)
      if (stationId === "checkIn") {
        await ctx.prisma.user.update({
          where: { id },
          data: { status: Status.CHECKED_IN },
        });
      } else {
        // For food/events, get the station and create event log
        const station = await ctx.prisma.station.findUnique({
          where: { id: stationId },
        });

        if (!station) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Station option not found",
          });
        }

        await ctx.prisma.eventLog.create({
          data: {
            userId: id,
            stationId: station.id,
            timestamp: new Date(),
          },
        });
      }

      const userInfo = {
        id: user.id,
        name: user.name,
        email: user.email,
      };
      return userInfo;
    }),
});
