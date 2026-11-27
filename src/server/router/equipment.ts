import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "./trpc";
import {
  Role,
  EquipmentType,
  EquipmentAction,
  Prisma,
  PrismaClient,
} from "@prisma/client";
import { z } from "zod";
import { Session } from "next-auth";
import {
  getOutstandingHardware,
  hardwareItemSchema,
  parseHardwareLogItems,
} from "../../utils/hardware";

const assertHardwareAccess = (session: Session) => {
  const allowedRoles = [Role.ADMIN, Role.GENERAL_SCANNER];
  if (!allowedRoles.some((role) => session.user?.role.includes(role))) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You don't have permission to perform this action",
    });
  }
};

const hardwareUserSelect = {
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
} satisfies Prisma.UserSelect;

const uniqueItemNames = (items: { name: string }[]) =>
  new Set(items.map((item) => item.name)).size === items.length;

const getHardwareLogsForUser = (prisma: PrismaClient, userId: string) =>
  prisma.equipmentLog.findMany({
    where: { userId, type: EquipmentType.HARDWARE },
    select: { action: true, items: true },
    orderBy: { timestamp: "asc" },
  });

const getOutstandingHardwareByUser = async (prisma: PrismaClient) => {
  const logs = await prisma.equipmentLog.findMany({
    where: { type: EquipmentType.HARDWARE },
    select: {
      userId: true,
      action: true,
      items: true,
      timestamp: true,
      user: { select: hardwareUserSelect },
      admin: { select: hardwareUserSelect },
    },
    orderBy: { timestamp: "asc" },
  });

  const logsByUser = new Map<string, typeof logs>();
  for (const log of logs) {
    logsByUser.set(log.userId, [...(logsByUser.get(log.userId) ?? []), log]);
  }

  return Array.from(logsByUser.values())
    .map((userLogs) => {
      const lastCheckout = userLogs.findLast(
        (log) => log.action === EquipmentAction.CHECK_OUT,
      );
      return {
        user: userLogs[0]!.user,
        ...getOutstandingHardware(userLogs),
        lastCheckout: lastCheckout?.timestamp ?? null,
        admin: lastCheckout?.admin ?? null,
      };
    })
    .filter((row) => row.items.length > 0)
    .sort(
      (a, b) =>
        (b.lastCheckout?.getTime() ?? 0) - (a.lastCheckout?.getTime() ?? 0),
    );
};

export const equipmentRouter = router({
  getSleepingBagStats: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.session.user.role.includes(Role.ADMIN)) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    const logs = await ctx.prisma.equipmentLog.findMany({
      where: { type: EquipmentType.SLEEPING_BAG },
      select: { action: true },
    });

    const checkouts = logs.filter(
      (log) => log.action === EquipmentAction.CHECK_OUT,
    ).length;
    const returns = logs.filter(
      (log) => log.action === EquipmentAction.RETURN,
    ).length;

    return {
      totalCheckouts: checkouts,
      totalReturns: returns,
      currentlyCheckedOut: checkouts - returns,
    };
  }),

  getSleepingBagLogs: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        cursor: z.string().nullish(),
        search: z.string().optional(),
        action: z.nativeEnum(EquipmentAction).optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      if (!ctx.session.user.role.includes(Role.ADMIN)) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const { limit, cursor, search, action } = input;

      const where: Prisma.EquipmentLogWhereInput = {
        type: EquipmentType.SLEEPING_BAG,
        ...(action && { action }),
        ...(search && {
          OR: [
            {
              user: {
                name: { contains: search, mode: "insensitive" },
              },
            },
            {
              user: {
                email: { contains: search, mode: "insensitive" },
              },
            },
            {
              user: {
                DH13Application: {
                  firstName: { contains: search, mode: "insensitive" },
                },
              },
            },
            {
              user: {
                DH13Application: {
                  lastName: { contains: search, mode: "insensitive" },
                },
              },
            },
          ],
        }),
      };

      const items = await ctx.prisma.equipmentLog.findMany({
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
          admin: {
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
        },
      });

      let nextCursor: string | undefined = undefined;
      if (items.length > limit) {
        const nextItem = items.pop();
        nextCursor = nextItem!.id;
      }

      return {
        items,
        nextCursor,
      };
    }),

  getUsersWithUnreturnedBags: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.session.user.role.includes(Role.ADMIN)) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    // Get all sleeping bag logs grouped by user
    const logs = await ctx.prisma.equipmentLog.findMany({
      where: { type: EquipmentType.SLEEPING_BAG },
      select: {
        userId: true,
        action: true,
        timestamp: true,
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
        admin: {
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
      },
      orderBy: { timestamp: "desc" },
    });

    // Group logs by userId and calculate checkout/return counts
    const userStats = new Map<
      string,
      {
        user: (typeof logs)[0]["user"];
        admin: (typeof logs)[0]["admin"];
        checkouts: number;
        returns: number;
        lastCheckout: Date | null;
      }
    >();

    for (const log of logs) {
      const existing = userStats.get(log.userId);
      if (!existing) {
        userStats.set(log.userId, {
          user: log.user,
          admin: log.action === EquipmentAction.CHECK_OUT ? log.admin : null!,
          checkouts: log.action === EquipmentAction.CHECK_OUT ? 1 : 0,
          returns: log.action === EquipmentAction.RETURN ? 1 : 0,
          lastCheckout:
            log.action === EquipmentAction.CHECK_OUT ? log.timestamp : null,
        });
      } else {
        if (log.action === EquipmentAction.CHECK_OUT) {
          existing.checkouts++;
          if (!existing.lastCheckout) {
            existing.lastCheckout = log.timestamp;
            existing.admin = log.admin;
          }
        } else {
          existing.returns++;
        }
      }
    }

    // Filter to users who have unreturned bags (checkouts > returns)
    const usersWithUnreturnedBags = Array.from(userStats.values())
      .filter((stat) => stat.checkouts > stat.returns)
      .map((stat) => ({
        user: stat.user,
        admin: stat.admin,
        lastCheckout: stat.lastCheckout,
      }))
      .sort((a, b) => {
        // Sort by lastCheckout date, most recent first
        if (!a.lastCheckout) return 1;
        if (!b.lastCheckout) return -1;
        return b.lastCheckout.getTime() - a.lastCheckout.getTime();
      });

    return usersWithUnreturnedBags;
  }),

  getHardwareStatus: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      assertHardwareAccess(ctx.session);

      const user = await ctx.prisma.user.findFirst({
        where: { id: input.userId },
        select: { ...hardwareUserSelect, DH13Application: true },
      });
      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Attendee not found. This QR code is not registered.",
        });
      }
      if (!user.DH13Application) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User didn't apply to the event",
        });
      }

      const logs = await getHardwareLogsForUser(ctx.prisma, user.id);

      return {
        id: user.id,
        name: `${user.DH13Application.firstName} ${user.DH13Application.lastName}`,
        email: user.email,
        ...getOutstandingHardware(logs),
      };
    }),

  signOutHardware: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        items: z
          .array(hardwareItemSchema.omit({ freeText: true }))
          .min(1, "Add at least one item")
          .refine(uniqueItemNames, "Each item can only be added once"),
        idCollected: z.boolean(),
        notes: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      assertHardwareAccess(ctx.session);

      const hardwareList = await ctx.prisma.station.findMany({
        where: { name: "hardware" },
        select: { option: true },
      });
      const listedNames = new Set(hardwareList.map((s) => s.option));

      return await ctx.prisma.equipmentLog.create({
        data: {
          userId: input.userId,
          adminId: ctx.session.user.id,
          type: EquipmentType.HARDWARE,
          action: EquipmentAction.CHECK_OUT,
          timestamp: new Date(),
          items: {
            items: input.items.map((item) => ({
              ...item,
              freeText: !listedNames.has(item.name),
            })),
            idCollected: input.idCollected,
          },
          notes: input.notes.trim(),
        },
      });
    }),

  returnHardware: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        items: z
          .array(hardwareItemSchema.omit({ freeText: true }))
          .min(1, "Return at least one item")
          .refine(uniqueItemNames, "Each item can only be returned once"),
        notes: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      assertHardwareAccess(ctx.session);

      // ponytail: no lock, two execs returning for the same hacker at the same moment could both pass this check
      const logs = await getHardwareLogsForUser(ctx.prisma, input.userId);
      const outstanding = getOutstandingHardware(logs).items;

      for (const item of input.items) {
        const outstandingQuantity =
          outstanding.find((o) => o.name === item.name)?.quantity ?? 0;
        if (item.quantity > outstandingQuantity) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Cannot return ${item.quantity} x ${item.name}, only ${outstandingQuantity} signed out`,
          });
        }
      }

      const log = await ctx.prisma.equipmentLog.create({
        data: {
          userId: input.userId,
          adminId: ctx.session.user.id,
          type: EquipmentType.HARDWARE,
          action: EquipmentAction.RETURN,
          timestamp: new Date(),
          items: { items: input.items },
          notes: input.notes.trim(),
        },
      });

      return {
        allReturned: getOutstandingHardware([...logs, log]).items.length === 0,
      };
    }),

  getHardwareStats: protectedProcedure.query(async ({ ctx }) => {
    assertHardwareAccess(ctx.session);

    const [totalSignOuts, totalReturns, outstanding] = await Promise.all([
      ctx.prisma.equipmentLog.count({
        where: {
          type: EquipmentType.HARDWARE,
          action: EquipmentAction.CHECK_OUT,
        },
      }),
      ctx.prisma.equipmentLog.count({
        where: {
          type: EquipmentType.HARDWARE,
          action: EquipmentAction.RETURN,
        },
      }),
      getOutstandingHardwareByUser(ctx.prisma),
    ]);

    return {
      hackersWithOutstanding: outstanding.length,
      unitsOutstanding: outstanding
        .flatMap((row) => row.items)
        .reduce((sum, item) => sum + item.quantity, 0),
      totalSignOuts,
      totalReturns,
    };
  }),

  getUsersWithOutstandingHardware: protectedProcedure.query(async ({ ctx }) => {
    assertHardwareAccess(ctx.session);
    return await getOutstandingHardwareByUser(ctx.prisma);
  }),

  getHardwareLogs: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        cursor: z.string().nullish(),
        search: z.string().optional(),
        action: z.nativeEnum(EquipmentAction).optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      assertHardwareAccess(ctx.session);

      const { limit, cursor, search, action } = input;

      const where: Prisma.EquipmentLogWhereInput = {
        type: EquipmentType.HARDWARE,
        ...(action && { action }),
        ...(search && {
          user: {
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
          },
        }),
      };

      const logs = await ctx.prisma.equipmentLog.findMany({
        where,
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { timestamp: "desc" },
        include: {
          user: { select: hardwareUserSelect },
          admin: { select: hardwareUserSelect },
        },
      });

      let nextCursor: string | undefined = undefined;
      if (logs.length > limit) {
        const nextItem = logs.pop();
        nextCursor = nextItem!.id;
      }

      return {
        items: logs.map((log) => {
          const { items, idCollected } = parseHardwareLogItems(log.items);
          return { ...log, items, idCollected: idCollected ?? false };
        }),
        nextCursor,
      };
    }),
});
