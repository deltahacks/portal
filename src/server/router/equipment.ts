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
});
