import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "./trpc";
import { Role, EquipmentType, EquipmentAction, Prisma } from "@prisma/client";
import { z } from "zod";

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
                DH12Application: {
                  firstName: { contains: search, mode: "insensitive" },
                },
              },
            },
            {
              user: {
                DH12Application: {
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
              DH12Application: {
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
              DH12Application: {
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
            DH12Application: {
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
            DH12Application: {
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
});
