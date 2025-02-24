import { Role } from "@prisma/client";
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
          DH11Application: {
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

      // update the DH11Application status to checked in

      // get user
      const user = await ctx.prisma.user.findFirst({
        where: { id: input },
        include: {
          DH11Application: true,
        },
      });

      if (user == null || user == undefined) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      // update the DH11Application status to checked in
      await ctx.prisma.dH11Application.update({
        where: { id: user.DH11Application?.id },
        data: {
          status: "CHECKED_IN",
        },
      });
    }),

  byRole: protectedProcedure
    .input(z.object({ role: z.nullable(z.nativeEnum(Role)) }))
    .query(async ({ ctx, input }) => {
      if (!ctx.session.user.role.includes(Role.ADMIN)) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      if (input.role === null) {
        return await ctx.prisma?.user.findMany();
      }
      return await ctx.prisma?.user.findMany({
        where: {
          role: {
            has: input.role,
          },
        },
      });
    }),

  countByRole: protectedProcedure
    .input(z.object({ role: z.nullable(z.nativeEnum(Role)) }))
    .query(async ({ ctx, input }) => {
      if (!ctx.session.user.role.includes(Role.ADMIN)) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      if (input.role === null) {
        return await ctx.prisma?.user.count();
      }
      return await ctx.prisma?.user.count({
        where: {
          role: {
            has: input.role,
          },
        },
      });
    }),

  byRolePaginated: protectedProcedure
    .input(
      z.object({
        role: z.nullable(z.nativeEnum(Role)),
        skip: z.number().int().min(0),
        take: z.number().int().min(1).max(50), // Limit to 50 users per page max
      })
    )
    .query(async ({ ctx, input }) => {
      if (!ctx.session.user.role.includes(Role.ADMIN)) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      if (input.role === null) {
        return await ctx.prisma?.user.findMany({
          skip: input.skip,
          take: input.take,
          orderBy: {
            name: "asc",
          },
        });
      }
      return await ctx.prisma?.user.findMany({
        where: {
          role: {
            has: input.role,
          },
        },
        skip: input.skip,
        take: input.take,
        orderBy: {
          name: "asc",
        },
      });
    }),

  searchUsersByNameAndRole: protectedProcedure
    .input(
      z.object({
        nameSearch: z.string().optional(),
        role: z.nullable(z.nativeEnum(Role)),
        skip: z.number().int().min(0),
        take: z.number().int().min(1).max(50), // Limit to 50 users per page max
      })
    )
    .query(async ({ ctx, input }) => {
      if (!ctx.session.user.role.includes(Role.ADMIN)) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      // Build the where clause based on inputs
      const whereClause: any = {};

      // Add name search if provided
      if (input.nameSearch && input.nameSearch.trim() !== "") {
        whereClause.name = {
          contains: input.nameSearch.trim(),
          mode: "insensitive", // Case insensitive search
        };
      }

      // Add role filter if provided
      if (input.role !== null) {
        whereClause.role = {
          has: input.role,
        };
      }

      // Get users with pagination
      const users = await ctx.prisma.user.findMany({
        where: whereClause,
        skip: input.skip,
        take: input.take,
        orderBy: {
          name: "asc",
        },
      });

      // Count total users matching the criteria for pagination
      const totalCount = await ctx.prisma.user.count({
        where: whereClause,
      });

      return {
        users,
        totalCount,
      };
    }),

  countSearchUsersByNameAndRole: protectedProcedure
    .input(
      z.object({
        nameSearch: z.string().optional(),
        role: z.nullable(z.nativeEnum(Role)),
      })
    )
    .query(async ({ ctx, input }) => {
      if (!ctx.session.user.role.includes(Role.ADMIN)) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      // Build the where clause based on inputs
      const whereClause: any = {};

      // Add name search if provided
      if (input.nameSearch && input.nameSearch.trim() !== "") {
        whereClause.name = {
          contains: input.nameSearch.trim(),
          mode: "insensitive", // Case insensitive search
        };
      }

      // Add role filter if provided
      if (input.role !== null) {
        whereClause.role = {
          has: input.role,
        };
      }

      // Count total users matching the criteria
      return await ctx.prisma.user.count({
        where: whereClause,
      });
    }),

  addRole: protectedProcedure
    .input(z.object({ id: z.string().cuid(), role: z.nativeEnum(Role) }))
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
    .input(z.object({ id: z.string().cuid(), role: z.nativeEnum(Role) }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session.user.role.includes(Role.ADMIN)) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      if (!ctx.session.user.role.includes(input.role)) {
        return;
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
