// src/server/router/index.ts
import { createRouter } from "./context";
import superjson from "superjson";
import { applicationRouter } from "./application";
import { reviewerRouter } from "./reviewers";
import { userRouter } from "./users";

export const appRouter = createRouter()
  .transformer(superjson)
  .merge("application.", applicationRouter)
  .merge("reviewer.", reviewerRouter)
  .merge("user.", userRouter);

// export type definition of API
export type AppRouter = typeof appRouter;
