// src/server/router/index.ts
import { createRouter } from "./context";
import superjson from "superjson";

import { exampleRouter } from "./exmaple";
import { protectedExampleRouter } from "./protected-example-router";
import { applicationRouter } from "./application";

export const appRouter = createRouter()
  .transformer(superjson)
  .merge("application.", applicationRouter);

// export type definition of API
export type AppRouter = typeof appRouter;
