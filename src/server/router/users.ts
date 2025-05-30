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

      const user = await ctx.prisma?.user.findFirst({
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
              // ensure all fields needed by `application` on frontend are here
            },
          },
          DH12Application: { // Include DH12Application
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
              // ensure all fields needed by `application` on frontend are here
            },
          },
        },
      });

      if (!user) return null;

      // Prioritize DH12Application, then DH11Application for the generic 'application' field
      const applicationData = user.DH12Application || user.DH11Application || null;
      
      return {
        ...user,
        application: applicationData, // Add the generic 'application' field
      };
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
          DH12Application: true, // Include DH12Application
        },
      });

      if (user == null || user == undefined) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      if (user.DH12Application) {
        await ctx.prisma.dH12Application.update({
          where: { id: user.DH12Application.id },
          data: { status: "CHECKED_IN" },
        });
      } else if (user.DH11Application) {
        // Fallback to DH11 if DH12 doesn't exist for this user
        await ctx.prisma.dH11Application.update({
          where: { id: user.DH11Application.id },
          data: { status: "CHECKED_IN" },
        });
      } else {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No application found for this user to check in.",
        });
      }
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
