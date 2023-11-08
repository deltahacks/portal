import * as z from "zod";
import { CompleteUser, RelatedUserModel } from "./index";

export const EventLogModel = z.object({
  id: z.string(),
  userId: z.string(),
  timestamp: z.date(),
  event: z.string(),
});

export interface CompleteEventLog extends z.infer<typeof EventLogModel> {
  user: CompleteUser;
}

/**
 * RelatedEventLogModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedEventLogModel: z.ZodSchema<CompleteEventLog> = z.lazy(() =>
  EventLogModel.extend({
    user: RelatedUserModel,
  })
);
