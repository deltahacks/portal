import * as z from "zod";
import { Role, Status } from "@prisma/client";
import {
  CompleteAccount,
  RelatedAccountModel,
  CompleteSession,
  RelatedSessionModel,
  CompleteReview,
  RelatedReviewModel,
  CompleteEventLog,
  RelatedEventLogModel,
  CompleteDH10Application,
  RelatedDH10ApplicationModel,
} from "./index";

export const UserModel = z.object({
  id: z.string(),
  name: z.string().nullish(),
  email: z.string().nullish(),
  emailVerified: z.date().nullish(),
  image: z.string().nullish(),
  typeform_response_id: z.string().nullish(),
  role: z.nativeEnum(Role).array(),
  status: z.nativeEnum(Status),
  qrcode: z.number().int().nullish(),
  mealsTaken: z.number().int(),
  lastMealTaken: z.date().nullish(),
  dH10ApplicationId: z.string().nullish(),
});

export interface CompleteUser extends z.infer<typeof UserModel> {
  accounts: CompleteAccount[];
  sessions: CompleteSession[];
  hacker: CompleteReview[];
  reviewer: CompleteReview[];
  EventLog: CompleteEventLog[];
  dh10application?: CompleteDH10Application | null;
}

/**
 * RelatedUserModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedUserModel: z.ZodSchema<CompleteUser> = z.lazy(() =>
  UserModel.extend({
    accounts: RelatedAccountModel.array(),
    sessions: RelatedSessionModel.array(),
    hacker: RelatedReviewModel.array(),
    reviewer: RelatedReviewModel.array(),
    EventLog: RelatedEventLogModel.array(),
    dh10application: RelatedDH10ApplicationModel.nullish(),
  })
);
