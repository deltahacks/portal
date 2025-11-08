// src/server/router/index.ts
import { applicationRouter } from "./application";
import { reviewerRouter } from "./reviewers";
import { foodRouter } from "./food";
import { sponsorRouter } from "./sponsors";
import { eventsRouter } from "./events";
import { userRouter } from "./users";
import { router } from "./trpc";
import { adminRouter } from "./admin";
import { fileUploadRouter } from "./file";
import {
  tableRouter,
  trackRouter,
  projectRouter,
  judgingRouter,
  timeSlotRouter,
} from "./judging";
import { scannerRouter } from "./scanner";

export const appRouter = router({
  application: applicationRouter,
  reviewer: reviewerRouter,
  user: userRouter,
  admin: adminRouter,
  file: fileUploadRouter,
  table: tableRouter,
  track: trackRouter,
  project: projectRouter,
  judging: judgingRouter,
  timeSlot: timeSlotRouter,
  scanner: scannerRouter,
  // NOTE: Will be deprecated
  food: foodRouter,
  events: eventsRouter,
  sponsor: sponsorRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
