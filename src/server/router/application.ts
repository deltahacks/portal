import { Status } from "@prisma/client";
import { z } from "zod";
import * as trpc from "@trpc/server";
import { createProtectedRouter } from "./context";
import { TRPCError } from "@trpc/server";

// Example router with queries that can only be hit if the user requesting is signed in
export const applicationRouter = createProtectedRouter()
  .query("received", {
    async resolve({ ctx }) {
      const user = await ctx.prisma?.user.findFirst({
        where: { id: ctx.session.user.id },
      });

      if (!user) {
        return false;
      }
      if (
        user.typeform_response_id === undefined ||
        user.typeform_response_id === null
      ) {
        return false;
      }
      return true;
    },
  })
  .query("rsvpCount", {
    output: z.number(),
    async resolve({ ctx }) {
      if (
        !(
          ctx.session.user.role.includes("ADMIN") ||
          ctx.session.user.role.includes("REVIEWER")
        )
      ) {
        throw new trpc.TRPCError({ code: "UNAUTHORIZED" });
      }
      const rsvp_count =
        (await ctx.prisma.user.count({
          where: {
            status: Status.RSVP,
          },
        })) || 0;

      return rsvp_count;
    },
  })
  .query("status", {
    output: z.string(),
    async resolve({ ctx }) {
      const user = await ctx.prisma?.user.findFirst({
        where: { id: ctx.session.user.id },
      });
      if (!user) {
        return "NULL";
      }
      if (
        user.typeform_response_id === undefined ||
        user.typeform_response_id === null
      ) {
        return "NULL";
      }

      return user.status;
    },
  })
  .mutation("rsvp", {
    async resolve({ ctx, input }) {
      const user = await ctx.prisma?.user.findFirst({
        where: { id: ctx.session.user.id },
      });

      if (user?.status != Status.ACCEPTED) {
        throw new Error("Unauthorized call");
      }

      await ctx.prisma?.user.update({
        where: { id: ctx.session.user.id },
        data: { status: Status.RSVP },
      });
    },
  })
  .mutation("submit", {
    input: z.object({ id: z.string() }),
    async resolve({ ctx, input }) {
      await ctx.prisma.user.update({
        where: { id: ctx.session.user.id },
        data: {
          typeform_response_id: input.id,
        },
      });
    },
  })
  .mutation("checkIn", {
    input: z.number(),
    async resolve({ ctx, input }) {
      // Ensure that user does not have a QR code already
      const user = await ctx.prisma.user.findFirst({
        where: { id: ctx.session.user.id },
      });

      if (user?.qrcode !== null || user.qrcode !== undefined) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are already checked in.",
        });
      }

      // Check if this was because there was a duplicate in the DB
      // this means this QR code is already registered to someone else
      const qrCount = await ctx.prisma.user.count({
        where: { qrcode: input },
      });

      if (qrCount != 0) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "This QR code is already in use",
        });
      }

      // Actual Update
      await ctx.prisma.user.update({
        where: { id: ctx.session.user.id },
        data: {
          qrcode: input,
        },
      });
    },
  });
