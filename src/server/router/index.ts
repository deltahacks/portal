// src/server/router/index.ts
import { createRouter } from "./context";
import superjson from "superjson";
import { applicationRouter } from "./application";
import { reviewerRouter } from "./reviewers";
import { foodRouter } from "./food";
import { sponsorRouter } from "./sponsors";
import { eventsRouter } from "./events";
import { userRouter } from "./users";
import { mergeRouters, publicProcedure, router } from "./trpc";

const legacyRouter = createRouter()
  .transformer(superjson)
  .merge("application.", applicationRouter)
  .merge("reviewer.", reviewerRouter)
  .merge("food.", foodRouter)
  .merge("sponsor.", sponsorRouter)
  .merge("events.", eventsRouter)
  .merge("user.", userRouter)
  .interop();

const newRouter = router({
  ping: publicProcedure.query(() => "pong"),
});

export const appRouter = mergeRouters(legacyRouter, newRouter);

// export type definition of API
export type AppRouter = typeof appRouter;
