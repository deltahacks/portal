import * as z from "zod"
import { CompleteUser, RelatedUserModel } from "./index"

export const DH10ApplicationModel = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  birthday: z.date(),
  studyEnrolledPostSecondary: z.boolean(),
  studyLocation: z.string(),
  studyDegree: z.string(),
  studyMajor: z.string(),
  studyYearOfStudy: z.number().int(),
  studyExpectedGraduation: z.date(),
  previousHackathonsCount: z.number().int(),
  longAnswerChange: z.string(),
  longAnswerExperience: z.string(),
  longAnswerTech: z.string(),
  longAnswerMeaning: z.string(),
  longAnswerFuture: z.string(),
  longAnswerMagic: z.string(),
  socialText: z.string().nullish(),
  interests: z.string().nullish(),
  tshirtSize: z.string(),
  hackerKind: z.string(),
  alreadyHaveTeam: z.boolean(),
  workshopChoices: z.string().array(),
  considerCoffee: z.boolean(),
  discoverdFrom: z.string(),
  gender: z.string(),
  race: z.string(),
  emergencyContactName: z.string(),
  emergencyContactPhone: z.string(),
  emergencyContactRelation: z.string(),
  agreeToMLHCodeOfConduct: z.boolean(),
  agreeToMLHPrivacyPolicy: z.boolean(),
  agreeToMLHCommunications: z.boolean(),
})

export interface CompleteDH10Application extends z.infer<typeof DH10ApplicationModel> {
  User?: CompleteUser | null
}

/**
 * RelatedDH10ApplicationModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedDH10ApplicationModel: z.ZodSchema<CompleteDH10Application> = z.lazy(() => DH10ApplicationModel.extend({
  User: RelatedUserModel.nullish(),
}))
