// src/server/router/index.ts
import { applicationSchemaRouter } from "./applicationSchema";
import { applicationRouter } from "./application";
import { reviewerRouter } from "./reviewers";
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
import { rubricRouter } from "./rubric";

export const appRouter = router({
  applicationSchema: applicationSchemaRouter,
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
  rubric: rubricRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
