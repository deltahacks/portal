import * as z from "zod"
import { CompleteUser, RelatedUserModel } from "./index"

export const ReviewModel = z.object({
  id: z.string(),
  hackerId: z.string(),
  reviewerId: z.string(),
  mark: z.number(),
})

export interface CompleteReview extends z.infer<typeof ReviewModel> {
  hacker: CompleteUser
  reviewer: CompleteUser
}

/**
 * RelatedReviewModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedReviewModel: z.ZodSchema<CompleteReview> = z.lazy(() => ReviewModel.extend({
  hacker: RelatedUserModel,
  reviewer: RelatedUserModel,
}))
