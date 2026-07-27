import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "./trpc";
import {
  Role,
  Status,
  Prisma,
  EquipmentType,
  EquipmentAction,
} from "@prisma/client";
import { z } from "zod";

export const scannerRouter = router({
  getEventLogs: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        cursor: z.string().optional(),
        stationType: z.enum(["food", "events"]).optional(),
        stationId: z.string().optional(),
        search: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      if (!ctx.session.user.role.includes(Role.ADMIN)) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const { limit, cursor, stationType, stationId, search } = input;

      const where: Prisma.EventLogWhereInput = {};

      if (stationType) {
        where.station = { name: stationType };
      }

      if (stationId) {
        where.stationId = stationId;
      }

      if (search) {
        where.user = {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
            {
              DH13Application: {
                OR: [
                  { firstName: { contains: search, mode: "insensitive" } },
                  { lastName: { contains: search, mode: "insensitive" } },
                ],
              },
            },
          ],
        };
      }

      const eventLogs = await ctx.prisma.eventLog.findMany({
        where,
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { timestamp: "desc" },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              DH13Application: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
          station: {
            select: {
              id: true,
              name: true,
              option: true,
            },
          },
        },
      });

      let nextCursor: string | undefined;
      if (eventLogs.length > limit) {
        const nextItem = eventLogs.pop();
        nextCursor = nextItem?.id;
      }

      return {
        items: eventLogs,
        nextCursor,
      };
    }),

  getEventLogStats: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.session.user.role.includes(Role.ADMIN)) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    const [totalLogs, foodLogs, eventLogs, stationCounts] = await Promise.all([
      ctx.prisma.eventLog.count(),
      ctx.prisma.eventLog.count({
        where: { station: { name: "food" } },
      }),
      ctx.prisma.eventLog.count({
        where: { station: { name: "events" } },
      }),
      ctx.prisma.station.findMany({
        include: { _count: { select: { eventLogs: true } } },
        orderBy: { name: "asc" },
      }),
    ]);

    return {
      totalLogs,
      foodLogs,
      eventLogs,
      stationCounts,
    };
  }),

  listStations: protectedProcedure.query(async ({ ctx }) => {
    const stations = await ctx.prisma.station.findMany({
      orderBy: { id: "asc" },
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

  getStationOptions: protectedProcedure
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

  searchUsers: protectedProcedure
    .input(
      z.object({
        query: z.string().min(1),
      }),
    )
    .output(
      z.array(
        z.object({
          id: z.string(),
          name: z.string(),
          email: z.string().nullable(),
          firstName: z.string().nullable(),
          lastName: z.string().nullable(),
        }),
      ),
    )
    .query(async ({ ctx, input }) => {
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

      const { query } = input;

      const users = await ctx.prisma.user.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { email: { contains: query, mode: "insensitive" } },
            {
              DH13Application: {
                OR: [
                  { firstName: { contains: query, mode: "insensitive" } },
                  { lastName: { contains: query, mode: "insensitive" } },
                ],
              },
            },
          ],
          DH13Application: {
            isNot: null,
          },
        },
        include: {
          DH13Application: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
        take: 20,
      });

      return users.map((user) => ({
        id: user.id,
        name: user.name ?? "Unknown",
        email: user.email,
        firstName: user.DH13Application?.firstName ?? null,
        lastName: user.DH13Application?.lastName ?? null,
      }));
    }),

  scan: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        stationId: z.string(),
      }),
    )
    .output(
      z.object({
        id: z.string(),
        name: z.string(),
        email: z.string().nullable(),
        image: z.string().nullable(),
        metadata: z.string(),
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
        include: { DH13Application: true },
      });
      if (user === null || user === undefined) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Attendee not found. This QR code is not registered.",
        });
      }
      // This exception is needed because judges don't have a DH13Application
      if (!user.DH13Application?.id && stationId !== "judges") {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User didn't apply to the event",
        });
      }

      const userInfo = {
        id: user.id,
        name:
          user.DH13Application?.firstName +
          " " +
          user.DH13Application?.lastName,
        email: user.email,
        image: user.image,
        metadata: "",
      };

      if (stationId === "checkIn") {
        // This code is intentionally explicit so it's easy to trace what happens to each status
        switch (user.DH13Application?.status) {
          case Status.IN_REVIEW:
          case Status.REJECTED:
          case Status.WAITLISTED:
          case Status.ACCEPTED: // This might look confusing but a user who didn't RSVP is also considered no accepted
            throw new TRPCError({
              code: "UNAUTHORIZED",
              message: "User was not accepted to the event",
            });
          case Status.CHECKED_IN:
            throw new TRPCError({
              code: "CONFLICT",
              message: "User is already checked in",
            });
          case Status.RSVP:
            await ctx.prisma.dH13Application.update({
              where: { id: user.DH13Application.id },
              data: { status: Status.CHECKED_IN },
            });
            break;
          default:
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Unknown status, unable to process check-in",
            });
        }
        userInfo.metadata = "T-Shirt Size: " + user.DH13Application?.tshirtSize;
      } else if (stationId === "judges") {
        if (!ctx.session.user.role.includes(Role.ADMIN)) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Only admins can assign judge roles",
          });
        }

        if (user.role.includes(Role.JUDGE)) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "User already has the judge role",
          });
        }

        await ctx.prisma.user.update({
          where: { id: user.id },
          data: {
            role: [...user.role, Role.JUDGE],
          },
        });
      } else if (stationId.startsWith("sleepingBag")) {
        // Get all sleeping bag logs for this user
        const logs = await ctx.prisma.equipmentLog.findMany({
          where: {
            userId: id,
            type: EquipmentType.SLEEPING_BAG,
          },
          orderBy: {
            timestamp: "asc",
          },
        });

        // Count checkouts and returns to determine if user currently has a sleeping bag
        const checkouts = logs.filter(
          (log) => log.action === EquipmentAction.CHECK_OUT,
        ).length;
        const returns = logs.filter(
          (log) => log.action === EquipmentAction.RETURN,
        ).length;
        const hasUnreturnedBag = checkouts > returns;

        // borrow or return
        const action = stationId.endsWith("borrow")
          ? EquipmentAction.CHECK_OUT
          : EquipmentAction.RETURN;

        if (action === EquipmentAction.CHECK_OUT && hasUnreturnedBag) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "User has already checked out a sleeping bag",
          });
        }
        if (action === EquipmentAction.RETURN && !hasUnreturnedBag) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "User has not checked out a sleeping bag",
          });
        }

        await ctx.prisma.equipmentLog.create({
          data: {
            action: action,
            type: EquipmentType.SLEEPING_BAG,
            userId: id,
            adminId: ctx.session.user.id,
          },
        });
      } else {
        if (user.DH13Application?.status !== Status.CHECKED_IN) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "User is not checked in",
          });
        }
        const station = await ctx.prisma.station.findUnique({
          where: { id: stationId },
        });

        if (!station) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Station option not found",
          });
        }
        const existing = await ctx.prisma.eventLog.findFirst({
          where: {
            userId: id,
            stationId,
          },
        });

        const messages: Record<string, string> = {
          checkIn: "This user has already been checked in",
          food: "This user has already claimed a meal",
          events: "This user has already checked in for this event",
        };

        if (existing) {
          throw new TRPCError({
            code: "CONFLICT",
            message: messages[station.name],
          });
        }

        await ctx.prisma.eventLog.create({
          data: {
            userId: id,
            stationId: station.id,
            timestamp: new Date(),
          },
        });
        if (station.name === "food") {
          userInfo.metadata =
            "Dietary Restrictions: " +
            (user.DH13Application?.dietaryRestrictions ?? "None");
        }
      }

      return userInfo;
    }),
});
