import { Status } from "@prisma/client";
import { z } from "zod";
import { createProtectedRouter } from "./context";

// Example router with queries that can only be hit if the user requesting is signed in
export const applicationRouter = createProtectedRouter()
  .query("received", {
    async resolve({ ctx }) {
      const user = await prisma?.user.findFirst({
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
  .query("status", {
    output: z.string(),
    async resolve({ ctx }) {
      const user = await prisma?.user.findFirst({
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
      const user = await prisma?.user.findFirst({
        where: { id: ctx.session.user.id },
      });

      if (user?.status != Status.ACCEPTED) {
        throw new Error("Unauthorized call");
      }

      await prisma?.user.update({
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
  });
