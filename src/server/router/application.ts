import { Status } from "@prisma/client";
import { z } from "zod";
import * as trpc from "@trpc/server";
import { createProtectedRouter } from "./context";
import { TRPCError } from "@trpc/server";
import type {
  TypeFormResponse,
  TypeFormSubmission,
  TypeFormResponseField,
} from "./reviewers";
import { options } from "./reviewers";

const TypeFormSubmissionTruncated = z.object({
  response_id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  birthday: z.date(),
});

type TypeFormSubmissionTruncated = z.infer<typeof TypeFormSubmissionTruncated>;

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
  .query("qr", {
    async resolve({ ctx }) {
      const user = await ctx.prisma.user.findFirst({
        where: { id: ctx.session.user.id },
      });
      const qr = user?.qrcode;

      return qr;
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

      if (user?.qrcode !== null) {
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
          status: Status.CHECKED_IN,
        },
      });
    },
  })
  .query("getUser", {
    async resolve({ ctx }) {
      // find their typeform response id
      const user = await ctx.prisma.user.findFirst({
        where: { id: ctx.session.user.id },
      });

      if (
        user?.typeform_response_id === null ||
        user?.typeform_response_id === undefined
      ) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const url = `https://api.typeform.com/forms/MVo09hRB/responses?included_response_ids=${user.typeform_response_id}`;
      const res = await fetch(url, options);
      const data: TypeFormResponse = await res.json();

      const converted: TypeFormSubmissionTruncated[] = data.items.map(
        (item) => {
          const responsePreprocessing = new Map<
            string,
            TypeFormResponseField
          >();
          for (const answer of item.answers) {
            responsePreprocessing.set(answer.field.id, answer);
          }

          return {
            response_id: item.response_id,
            firstName: responsePreprocessing.get("nfGel41KT3dP")?.text ?? "N/A",
            lastName: responsePreprocessing.get("mwP5oTr2JHgD")?.text ?? "N/A",
            birthday: new Date(
              responsePreprocessing.get("m7lNzS2BDhp1")?.date ?? "1000-01-01"
            ),
          };
        }
      );
      // Convert from TypeFormResponse to TypeFormSubmission
      return converted[0];
    },
  });
