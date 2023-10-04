import { TRPCError, initTRPC } from "@trpc/server";
import SuperJSON from "superjson";
import { createContext } from "./context";

const t = initTRPC.context<typeof createContext>().create({
  transformer: SuperJSON,
});

export const router = t.router;
export const mergeRouters = t.mergeRouters;
export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return next({
    ctx: {
      ...ctx,
      session: { ...ctx.session, user: ctx.session.user },
    },
  });
});
