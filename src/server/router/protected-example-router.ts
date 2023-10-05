import { protectedProcedure, router } from "./trpc";

// Example router with queries that can only be hit if the user requesting is signed in
export const protectedExampleRouter = router({
  getSession: protectedProcedure.query(({ ctx }) => {
    return ctx.session;
  }),
  getSecretMessage: protectedProcedure.query(({}) => {
    return "He who asks a question is a fool for five minutes; he who does not ask a question remains a fool forever.";
  }),
});
