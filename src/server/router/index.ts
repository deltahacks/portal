// src/server/router/index.ts
import { createRouter } from "./context";
import superjson from "superjson";
import { applicationRouter } from "./application";

export const appRouter = createRouter()
  .transformer(superjson)
  .merge("application.", applicationRouter);

// export type definition of API
export type AppRouter = typeof appRouter;
