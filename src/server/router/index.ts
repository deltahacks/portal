// src/server/router/index.ts
import { createRouter } from "./context";
import superjson from "superjson";
import { applicationRouter } from "./application";
import { reviewerRouter } from "./reviewers";
import { foodRouter } from "./food";
import { sponsorRouter } from "./sponsors";
import { eventsRouter } from "./events";

export const appRouter = createRouter()
  .transformer(superjson)
  .merge("application.", applicationRouter)
  .merge("reviewer.", reviewerRouter)
  .merge("food.", foodRouter)
  .merge("sponsor.", sponsorRouter)
  .merge("events.", eventsRouter);

// export type definition of API
export type AppRouter = typeof appRouter;
