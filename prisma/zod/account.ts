import * as z from "zod"
import { CompleteUser, RelatedUserModel } from "./index"

export const AccountModel = z.object({
  id: z.string(),
  userId: z.string(),
  type: z.string(),
  provider: z.string(),
  providerAccountId: z.string(),
  refresh_token: z.string().nullish(),
  refresh_token_expires_in: z.number().int().nullish(),
  access_token: z.string().nullish(),
  expires_at: z.number().int().nullish(),
  ext_expires_in: z.number().int().nullish(),
  oauth_token_secret: z.string().nullish(),
  oauth_token: z.string().nullish(),
  token_type: z.string().nullish(),
  scope: z.string().nullish(),
  id_token: z.string().nullish(),
  session_state: z.string().nullish(),
})

export interface CompleteAccount extends z.infer<typeof AccountModel> {
  user: CompleteUser
}

/**
 * RelatedAccountModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedAccountModel: z.ZodSchema<CompleteAccount> = z.lazy(() => AccountModel.extend({
  user: RelatedUserModel,
}))
