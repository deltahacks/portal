// src/server/router/index.ts
import { applicationRouter } from "./application";
import { reviewerRouter } from "./reviewers";
import { foodRouter } from "./food";
import { sponsorRouter } from "./sponsors";
import { eventsRouter } from "./events";
import { userRouter } from "./users";
import { publicProcedure, router } from "./trpc";

export const appRouter = router({
  ping: publicProcedure.query(() => "pong"),
  application: applicationRouter,
  reviewer: reviewerRouter,
  food: foodRouter,
  sponsor: sponsorRouter,
  events: eventsRouter,
  user: userRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
