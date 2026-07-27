import { Prisma, Role } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { protectedProcedure, router } from "./trpc";

export const userRouter = router({
  getProfile: protectedProcedure
    .input(z.string().optional())
    .query(async ({ ctx, input: id }) => {
      if (id == null) {
        id = ctx.session.user.id;
      }

      const userData = await ctx.prisma?.user.findFirst({
        where: { id },
        include: {
          DH13Application: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              socialText: true,
              studyLocation: true,
              studyDegree: true,
              studyYearOfStudy: true,
              studyMajor: true,
              status: true,
            },
          },
        },
      });

      return userData;
    }),

  checkIn: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session.user.role.includes(Role.ADMIN)) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      // update the DH13Application status to checked in

      // get user
      const user = await ctx.prisma.user.findFirst({
        where: { id: input },
        include: {
          DH13Application: true,
        },
      });

      if (user == null || user == undefined) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      if (!user.DH13Application?.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User didn't apply to the event",
        });
      }

      // update the DH13Application status to checked in
      await ctx.prisma.dH13Application.update({
        where: { id: user.DH13Application.id },
        data: {
          status: "CHECKED_IN",
        },
      });
    }),

  byRole: protectedProcedure
    .input(
      z.object({
        role: z.nullable(z.enum(Role)),
        page: z.number().min(1).default(1),
        limit: z.number().min(1).default(10),
        searchName: z.string().optional(),
      }),
    )

    .query(async ({ ctx, input }) => {
      if (!ctx.session.user.role.includes(Role.ADMIN)) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const { role, page, limit, searchName } = input;
      const skip = (page - 1) * limit;

      const whereClause: Prisma.UserWhereInput = {};

      if (role !== null) {
        whereClause.role = {
          has: role,
        };
      }

      if (searchName && searchName.trim() !== "") {
        whereClause.OR = [
          {
            name: {
              contains: searchName,
              mode: "insensitive",
            },
          },
          {
            email: {
              contains: searchName,
              mode: "insensitive",
            },
          },
        ];
      }

      const [users, totalCount] = await Promise.all([
        ctx.prisma?.user.findMany({
          where: Object.keys(whereClause).length > 0 ? whereClause : undefined,
          skip,
          take: limit,
        }),
        ctx.prisma?.user.count({
          where: Object.keys(whereClause).length > 0 ? whereClause : undefined,
        }),
      ]);
      return { users, totalCount };
    }),
  addRole: protectedProcedure
    .input(z.object({ id: z.cuid(), role: z.enum(Role) }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session.user.role.includes(Role.ADMIN)) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const user = await ctx.prisma.user.findFirst({
        where: { id: input.id },
      });

      if (user == null || user == undefined) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      // else update
      await ctx.prisma.user.update({
        where: { id: input.id },
        data: {
          role: [...user.role, input.role],
        },
      });
    }),
  removeRole: protectedProcedure
    .input(z.object({ id: z.cuid(), role: z.enum(Role) }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session.user.role.includes(Role.ADMIN)) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const { role } = (await ctx.prisma?.user.findFirstOrThrow({
        where: { id: input.id },
        select: { role: true },
      })) || { role: undefined };
      await ctx.prisma.user.update({
        where: { id: input.id },
        data: {
          role: {
            set: role?.filter((role) => role !== input.role),
          },
        },
      });
    }),
});
