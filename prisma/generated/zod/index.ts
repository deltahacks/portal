import { z } from 'zod';
import type { Prisma } from '@prisma/client';

/////////////////////////////////////////
// HELPER FUNCTIONS
/////////////////////////////////////////


/////////////////////////////////////////
// ENUMS
/////////////////////////////////////////

export const TransactionIsolationLevelSchema = z.enum(['Serializable']);

export const AccountScalarFieldEnumSchema = z.enum(['id','userId','type','provider','providerAccountId','refresh_token','refresh_token_expires_in','access_token','expires_at','ext_expires_in','oauth_token_secret','oauth_token','token_type','scope','id_token','session_state']);

export const SessionScalarFieldEnumSchema = z.enum(['id','sessionToken','userId','expires']);

export const UserScalarFieldEnumSchema = z.enum(['id','name','email','emailVerified','image','typeform_response_id','role','status','qrcode','mealsTaken','lastMealTaken','dH10ApplicationId']);

export const ReviewScalarFieldEnumSchema = z.enum(['id','hackerId','reviewerId','mark']);

export const EventLogScalarFieldEnumSchema = z.enum(['id','userId','timestamp','event']);

export const VerificationTokenScalarFieldEnumSchema = z.enum(['identifier','token','expires']);

export const DH10ApplicationScalarFieldEnumSchema = z.enum(['id','firstName','lastName','birthday','studyEnrolledPostSecondary','studyLocation','studyDegree','studyMajor','studyYearOfStudy','studyExpectedGraduation','previousHackathonsCount','longAnswerChange','longAnswerExperience','longAnswerTech','longAnswerMeaning','longAnswerFuture','longAnswerMagic','socialText','interests','tshirtSize','hackerKind','alreadyHaveTeam','workshopChoices','considerCoffee','discoverdFrom','gender','race','emergencyContactName','emergencyContactPhone','emergencyContactRelation','agreeToMLHCodeOfConduct','agreeToMLHPrivacyPolicy','agreeToMLHCommunications']);

export const SortOrderSchema = z.enum(['asc','desc']);

export const QueryModeSchema = z.enum(['default','insensitive']);

export const NullsOrderSchema = z.enum(['first','last']);

export const RoleSchema = z.enum(['HACKER','ADMIN','REVIEWER','FOOD_MANAGER','EVENT_MANAGER','GENERAL_SCANNER','SPONSER']);

export type RoleType = `${z.infer<typeof RoleSchema>}`

export const StatusSchema = z.enum(['IN_REVIEW','REJECTED','WAITLISTED','ACCEPTED','RSVP','CHECKED_IN']);

export type StatusType = `${z.infer<typeof StatusSchema>}`

/////////////////////////////////////////
// MODELS
/////////////////////////////////////////

/////////////////////////////////////////
// ACCOUNT SCHEMA
/////////////////////////////////////////

export const AccountSchema = z.object({
  id: z.string().cuid(),
  userId: z.string(),
  type: z.string(),
  provider: z.string(),
  providerAccountId: z.string(),
  refresh_token: z.string().nullable(),
  refresh_token_expires_in: z.number().int().nullable(),
  access_token: z.string().nullable(),
  expires_at: z.number().int().nullable(),
  ext_expires_in: z.number().int().nullable(),
  oauth_token_secret: z.string().nullable(),
  oauth_token: z.string().nullable(),
  token_type: z.string().nullable(),
  scope: z.string().nullable(),
  id_token: z.string().nullable(),
  session_state: z.string().nullable(),
})

export type Account = z.infer<typeof AccountSchema>

/////////////////////////////////////////
// SESSION SCHEMA
/////////////////////////////////////////

export const SessionSchema = z.object({
  id: z.string().cuid(),
  sessionToken: z.string(),
  userId: z.string(),
  expires: z.coerce.date(),
})

export type Session = z.infer<typeof SessionSchema>

/////////////////////////////////////////
// USER SCHEMA
/////////////////////////////////////////

export const UserSchema = z.object({
  role: RoleSchema.array(),
  status: StatusSchema,
  id: z.string().cuid(),
  name: z.string().nullable(),
  email: z.string().nullable(),
  emailVerified: z.coerce.date().nullable(),
  image: z.string().nullable(),
  typeform_response_id: z.string().nullable(),
  qrcode: z.number().int().nullable(),
  mealsTaken: z.number().int(),
  lastMealTaken: z.coerce.date().nullable(),
  dH10ApplicationId: z.string().nullable(),
})

export type User = z.infer<typeof UserSchema>

/////////////////////////////////////////
// REVIEW SCHEMA
/////////////////////////////////////////

export const ReviewSchema = z.object({
  id: z.string().cuid(),
  hackerId: z.string(),
  reviewerId: z.string(),
  mark: z.number(),
})

export type Review = z.infer<typeof ReviewSchema>

/////////////////////////////////////////
// EVENT LOG SCHEMA
/////////////////////////////////////////

export const EventLogSchema = z.object({
  id: z.string().cuid(),
  userId: z.string(),
  timestamp: z.coerce.date(),
  event: z.string(),
})

export type EventLog = z.infer<typeof EventLogSchema>

/////////////////////////////////////////
// VERIFICATION TOKEN SCHEMA
/////////////////////////////////////////

export const VerificationTokenSchema = z.object({
  identifier: z.string(),
  token: z.string(),
  expires: z.coerce.date(),
})

export type VerificationToken = z.infer<typeof VerificationTokenSchema>

/////////////////////////////////////////
// DH 10 APPLICATION SCHEMA
/////////////////////////////////////////

export const DH10ApplicationSchema = z.object({
  id: z.string().cuid(),
  firstName: z.string(),
  lastName: z.string(),
  birthday: z.coerce.date(),
  studyEnrolledPostSecondary: z.boolean(),
  studyLocation: z.string(),
  studyDegree: z.string(),
  studyMajor: z.string(),
  studyYearOfStudy: z.number().int(),
  studyExpectedGraduation: z.coerce.date(),
  previousHackathonsCount: z.number().int(),
  longAnswerChange: z.string(),
  longAnswerExperience: z.string(),
  longAnswerTech: z.string(),
  longAnswerMeaning: z.string(),
  longAnswerFuture: z.string(),
  longAnswerMagic: z.string(),
  socialText: z.string().nullable(),
  interests: z.string().nullable(),
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

export type DH10Application = z.infer<typeof DH10ApplicationSchema>

/////////////////////////////////////////
// SELECT & INCLUDE
/////////////////////////////////////////

// ACCOUNT
//------------------------------------------------------

export const AccountIncludeSchema: z.ZodType<Prisma.AccountInclude> = z.object({
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
}).strict()

export const AccountArgsSchema: z.ZodType<Prisma.AccountDefaultArgs> = z.object({
  select: z.lazy(() => AccountSelectSchema).optional(),
  include: z.lazy(() => AccountIncludeSchema).optional(),
}).strict();

export const AccountSelectSchema: z.ZodType<Prisma.AccountSelect> = z.object({
  id: z.boolean().optional(),
  userId: z.boolean().optional(),
  type: z.boolean().optional(),
  provider: z.boolean().optional(),
  providerAccountId: z.boolean().optional(),
  refresh_token: z.boolean().optional(),
  refresh_token_expires_in: z.boolean().optional(),
  access_token: z.boolean().optional(),
  expires_at: z.boolean().optional(),
  ext_expires_in: z.boolean().optional(),
  oauth_token_secret: z.boolean().optional(),
  oauth_token: z.boolean().optional(),
  token_type: z.boolean().optional(),
  scope: z.boolean().optional(),
  id_token: z.boolean().optional(),
  session_state: z.boolean().optional(),
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
}).strict()

// SESSION
//------------------------------------------------------

export const SessionIncludeSchema: z.ZodType<Prisma.SessionInclude> = z.object({
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
}).strict()

export const SessionArgsSchema: z.ZodType<Prisma.SessionDefaultArgs> = z.object({
  select: z.lazy(() => SessionSelectSchema).optional(),
  include: z.lazy(() => SessionIncludeSchema).optional(),
}).strict();

export const SessionSelectSchema: z.ZodType<Prisma.SessionSelect> = z.object({
  id: z.boolean().optional(),
  sessionToken: z.boolean().optional(),
  userId: z.boolean().optional(),
  expires: z.boolean().optional(),
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
}).strict()

// USER
//------------------------------------------------------

export const UserIncludeSchema: z.ZodType<Prisma.UserInclude> = z.object({
  accounts: z.union([z.boolean(),z.lazy(() => AccountFindManyArgsSchema)]).optional(),
  sessions: z.union([z.boolean(),z.lazy(() => SessionFindManyArgsSchema)]).optional(),
  hacker: z.union([z.boolean(),z.lazy(() => ReviewFindManyArgsSchema)]).optional(),
  reviewer: z.union([z.boolean(),z.lazy(() => ReviewFindManyArgsSchema)]).optional(),
  EventLog: z.union([z.boolean(),z.lazy(() => EventLogFindManyArgsSchema)]).optional(),
  dh10application: z.union([z.boolean(),z.lazy(() => DH10ApplicationArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => UserCountOutputTypeArgsSchema)]).optional(),
}).strict()

export const UserArgsSchema: z.ZodType<Prisma.UserDefaultArgs> = z.object({
  select: z.lazy(() => UserSelectSchema).optional(),
  include: z.lazy(() => UserIncludeSchema).optional(),
}).strict();

export const UserCountOutputTypeArgsSchema: z.ZodType<Prisma.UserCountOutputTypeDefaultArgs> = z.object({
  select: z.lazy(() => UserCountOutputTypeSelectSchema).nullish(),
}).strict();

export const UserCountOutputTypeSelectSchema: z.ZodType<Prisma.UserCountOutputTypeSelect> = z.object({
  accounts: z.boolean().optional(),
  sessions: z.boolean().optional(),
  hacker: z.boolean().optional(),
  reviewer: z.boolean().optional(),
  EventLog: z.boolean().optional(),
}).strict();

export const UserSelectSchema: z.ZodType<Prisma.UserSelect> = z.object({
  id: z.boolean().optional(),
  name: z.boolean().optional(),
  email: z.boolean().optional(),
  emailVerified: z.boolean().optional(),
  image: z.boolean().optional(),
  typeform_response_id: z.boolean().optional(),
  role: z.boolean().optional(),
  status: z.boolean().optional(),
  qrcode: z.boolean().optional(),
  mealsTaken: z.boolean().optional(),
  lastMealTaken: z.boolean().optional(),
  dH10ApplicationId: z.boolean().optional(),
  accounts: z.union([z.boolean(),z.lazy(() => AccountFindManyArgsSchema)]).optional(),
  sessions: z.union([z.boolean(),z.lazy(() => SessionFindManyArgsSchema)]).optional(),
  hacker: z.union([z.boolean(),z.lazy(() => ReviewFindManyArgsSchema)]).optional(),
  reviewer: z.union([z.boolean(),z.lazy(() => ReviewFindManyArgsSchema)]).optional(),
  EventLog: z.union([z.boolean(),z.lazy(() => EventLogFindManyArgsSchema)]).optional(),
  dh10application: z.union([z.boolean(),z.lazy(() => DH10ApplicationArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => UserCountOutputTypeArgsSchema)]).optional(),
}).strict()

// REVIEW
//------------------------------------------------------

export const ReviewIncludeSchema: z.ZodType<Prisma.ReviewInclude> = z.object({
  hacker: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
  reviewer: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
}).strict()

export const ReviewArgsSchema: z.ZodType<Prisma.ReviewDefaultArgs> = z.object({
  select: z.lazy(() => ReviewSelectSchema).optional(),
  include: z.lazy(() => ReviewIncludeSchema).optional(),
}).strict();

export const ReviewSelectSchema: z.ZodType<Prisma.ReviewSelect> = z.object({
  id: z.boolean().optional(),
  hackerId: z.boolean().optional(),
  reviewerId: z.boolean().optional(),
  mark: z.boolean().optional(),
  hacker: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
  reviewer: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
}).strict()

// EVENT LOG
//------------------------------------------------------

export const EventLogIncludeSchema: z.ZodType<Prisma.EventLogInclude> = z.object({
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
}).strict()

export const EventLogArgsSchema: z.ZodType<Prisma.EventLogDefaultArgs> = z.object({
  select: z.lazy(() => EventLogSelectSchema).optional(),
  include: z.lazy(() => EventLogIncludeSchema).optional(),
}).strict();

export const EventLogSelectSchema: z.ZodType<Prisma.EventLogSelect> = z.object({
  id: z.boolean().optional(),
  userId: z.boolean().optional(),
  timestamp: z.boolean().optional(),
  event: z.boolean().optional(),
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
}).strict()

// VERIFICATION TOKEN
//------------------------------------------------------

export const VerificationTokenSelectSchema: z.ZodType<Prisma.VerificationTokenSelect> = z.object({
  identifier: z.boolean().optional(),
  token: z.boolean().optional(),
  expires: z.boolean().optional(),
}).strict()

// DH 10 APPLICATION
//------------------------------------------------------

export const DH10ApplicationIncludeSchema: z.ZodType<Prisma.DH10ApplicationInclude> = z.object({
  User: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
}).strict()

export const DH10ApplicationArgsSchema: z.ZodType<Prisma.DH10ApplicationDefaultArgs> = z.object({
  select: z.lazy(() => DH10ApplicationSelectSchema).optional(),
  include: z.lazy(() => DH10ApplicationIncludeSchema).optional(),
}).strict();

export const DH10ApplicationSelectSchema: z.ZodType<Prisma.DH10ApplicationSelect> = z.object({
  id: z.boolean().optional(),
  firstName: z.boolean().optional(),
  lastName: z.boolean().optional(),
  birthday: z.boolean().optional(),
  studyEnrolledPostSecondary: z.boolean().optional(),
  studyLocation: z.boolean().optional(),
  studyDegree: z.boolean().optional(),
  studyMajor: z.boolean().optional(),
  studyYearOfStudy: z.boolean().optional(),
  studyExpectedGraduation: z.boolean().optional(),
  previousHackathonsCount: z.boolean().optional(),
  longAnswerChange: z.boolean().optional(),
  longAnswerExperience: z.boolean().optional(),
  longAnswerTech: z.boolean().optional(),
  longAnswerMeaning: z.boolean().optional(),
  longAnswerFuture: z.boolean().optional(),
  longAnswerMagic: z.boolean().optional(),
  socialText: z.boolean().optional(),
  interests: z.boolean().optional(),
  tshirtSize: z.boolean().optional(),
  hackerKind: z.boolean().optional(),
  alreadyHaveTeam: z.boolean().optional(),
  workshopChoices: z.boolean().optional(),
  considerCoffee: z.boolean().optional(),
  discoverdFrom: z.boolean().optional(),
  gender: z.boolean().optional(),
  race: z.boolean().optional(),
  emergencyContactName: z.boolean().optional(),
  emergencyContactPhone: z.boolean().optional(),
  emergencyContactRelation: z.boolean().optional(),
  agreeToMLHCodeOfConduct: z.boolean().optional(),
  agreeToMLHPrivacyPolicy: z.boolean().optional(),
  agreeToMLHCommunications: z.boolean().optional(),
  User: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
}).strict()


/////////////////////////////////////////
// INPUT TYPES
/////////////////////////////////////////

export const AccountWhereInputSchema: z.ZodType<Prisma.AccountWhereInput> = z.object({
  AND: z.union([ z.lazy(() => AccountWhereInputSchema),z.lazy(() => AccountWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => AccountWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => AccountWhereInputSchema),z.lazy(() => AccountWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  type: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  provider: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  providerAccountId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  refresh_token: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  refresh_token_expires_in: z.union([ z.lazy(() => IntNullableFilterSchema),z.number() ]).optional().nullable(),
  access_token: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  expires_at: z.union([ z.lazy(() => IntNullableFilterSchema),z.number() ]).optional().nullable(),
  ext_expires_in: z.union([ z.lazy(() => IntNullableFilterSchema),z.number() ]).optional().nullable(),
  oauth_token_secret: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  oauth_token: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  token_type: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  scope: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  id_token: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  session_state: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  user: z.union([ z.lazy(() => UserRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional(),
}).strict();

export const AccountOrderByWithRelationInputSchema: z.ZodType<Prisma.AccountOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  type: z.lazy(() => SortOrderSchema).optional(),
  provider: z.lazy(() => SortOrderSchema).optional(),
  providerAccountId: z.lazy(() => SortOrderSchema).optional(),
  refresh_token: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  refresh_token_expires_in: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  access_token: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  expires_at: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  ext_expires_in: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  oauth_token_secret: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  oauth_token: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  token_type: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  scope: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  id_token: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  session_state: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  user: z.lazy(() => UserOrderByWithRelationInputSchema).optional()
}).strict();

export const AccountWhereUniqueInputSchema: z.ZodType<Prisma.AccountWhereUniqueInput> = z.union([
  z.object({
    id: z.string().cuid(),
    provider_providerAccountId: z.lazy(() => AccountProviderProviderAccountIdCompoundUniqueInputSchema)
  }),
  z.object({
    id: z.string().cuid(),
  }),
  z.object({
    provider_providerAccountId: z.lazy(() => AccountProviderProviderAccountIdCompoundUniqueInputSchema),
  }),
])
.and(z.object({
  id: z.string().cuid().optional(),
  provider_providerAccountId: z.lazy(() => AccountProviderProviderAccountIdCompoundUniqueInputSchema).optional(),
  AND: z.union([ z.lazy(() => AccountWhereInputSchema),z.lazy(() => AccountWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => AccountWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => AccountWhereInputSchema),z.lazy(() => AccountWhereInputSchema).array() ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  type: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  provider: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  providerAccountId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  refresh_token: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  refresh_token_expires_in: z.union([ z.lazy(() => IntNullableFilterSchema),z.number().int() ]).optional().nullable(),
  access_token: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  expires_at: z.union([ z.lazy(() => IntNullableFilterSchema),z.number().int() ]).optional().nullable(),
  ext_expires_in: z.union([ z.lazy(() => IntNullableFilterSchema),z.number().int() ]).optional().nullable(),
  oauth_token_secret: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  oauth_token: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  token_type: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  scope: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  id_token: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  session_state: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  user: z.union([ z.lazy(() => UserRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional(),
}).strict());

export const AccountOrderByWithAggregationInputSchema: z.ZodType<Prisma.AccountOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  type: z.lazy(() => SortOrderSchema).optional(),
  provider: z.lazy(() => SortOrderSchema).optional(),
  providerAccountId: z.lazy(() => SortOrderSchema).optional(),
  refresh_token: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  refresh_token_expires_in: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  access_token: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  expires_at: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  ext_expires_in: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  oauth_token_secret: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  oauth_token: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  token_type: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  scope: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  id_token: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  session_state: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  _count: z.lazy(() => AccountCountOrderByAggregateInputSchema).optional(),
  _avg: z.lazy(() => AccountAvgOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => AccountMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => AccountMinOrderByAggregateInputSchema).optional(),
  _sum: z.lazy(() => AccountSumOrderByAggregateInputSchema).optional()
}).strict();

export const AccountScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.AccountScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => AccountScalarWhereWithAggregatesInputSchema),z.lazy(() => AccountScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => AccountScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => AccountScalarWhereWithAggregatesInputSchema),z.lazy(() => AccountScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  type: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  provider: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  providerAccountId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  refresh_token: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  refresh_token_expires_in: z.union([ z.lazy(() => IntNullableWithAggregatesFilterSchema),z.number() ]).optional().nullable(),
  access_token: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  expires_at: z.union([ z.lazy(() => IntNullableWithAggregatesFilterSchema),z.number() ]).optional().nullable(),
  ext_expires_in: z.union([ z.lazy(() => IntNullableWithAggregatesFilterSchema),z.number() ]).optional().nullable(),
  oauth_token_secret: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  oauth_token: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  token_type: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  scope: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  id_token: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  session_state: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
}).strict();

export const SessionWhereInputSchema: z.ZodType<Prisma.SessionWhereInput> = z.object({
  AND: z.union([ z.lazy(() => SessionWhereInputSchema),z.lazy(() => SessionWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => SessionWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => SessionWhereInputSchema),z.lazy(() => SessionWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  sessionToken: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  expires: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  user: z.union([ z.lazy(() => UserRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional(),
}).strict();

export const SessionOrderByWithRelationInputSchema: z.ZodType<Prisma.SessionOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  sessionToken: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  expires: z.lazy(() => SortOrderSchema).optional(),
  user: z.lazy(() => UserOrderByWithRelationInputSchema).optional()
}).strict();

export const SessionWhereUniqueInputSchema: z.ZodType<Prisma.SessionWhereUniqueInput> = z.union([
  z.object({
    id: z.string().cuid(),
    sessionToken: z.string()
  }),
  z.object({
    id: z.string().cuid(),
  }),
  z.object({
    sessionToken: z.string(),
  }),
])
.and(z.object({
  id: z.string().cuid().optional(),
  sessionToken: z.string().optional(),
  AND: z.union([ z.lazy(() => SessionWhereInputSchema),z.lazy(() => SessionWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => SessionWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => SessionWhereInputSchema),z.lazy(() => SessionWhereInputSchema).array() ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  expires: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  user: z.union([ z.lazy(() => UserRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional(),
}).strict());

export const SessionOrderByWithAggregationInputSchema: z.ZodType<Prisma.SessionOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  sessionToken: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  expires: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => SessionCountOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => SessionMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => SessionMinOrderByAggregateInputSchema).optional()
}).strict();

export const SessionScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.SessionScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => SessionScalarWhereWithAggregatesInputSchema),z.lazy(() => SessionScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => SessionScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => SessionScalarWhereWithAggregatesInputSchema),z.lazy(() => SessionScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  sessionToken: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  expires: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
}).strict();

export const UserWhereInputSchema: z.ZodType<Prisma.UserWhereInput> = z.object({
  AND: z.union([ z.lazy(() => UserWhereInputSchema),z.lazy(() => UserWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => UserWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UserWhereInputSchema),z.lazy(() => UserWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  name: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  email: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  emailVerified: z.union([ z.lazy(() => DateTimeNullableFilterSchema),z.coerce.date() ]).optional().nullable(),
  image: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  typeform_response_id: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  role: z.lazy(() => EnumRoleNullableListFilterSchema).optional(),
  status: z.union([ z.lazy(() => EnumStatusFilterSchema),z.lazy(() => StatusSchema) ]).optional(),
  qrcode: z.union([ z.lazy(() => IntNullableFilterSchema),z.number() ]).optional().nullable(),
  mealsTaken: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  lastMealTaken: z.union([ z.lazy(() => DateTimeNullableFilterSchema),z.coerce.date() ]).optional().nullable(),
  dH10ApplicationId: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  accounts: z.lazy(() => AccountListRelationFilterSchema).optional(),
  sessions: z.lazy(() => SessionListRelationFilterSchema).optional(),
  hacker: z.lazy(() => ReviewListRelationFilterSchema).optional(),
  reviewer: z.lazy(() => ReviewListRelationFilterSchema).optional(),
  EventLog: z.lazy(() => EventLogListRelationFilterSchema).optional(),
  dh10application: z.union([ z.lazy(() => DH10ApplicationNullableRelationFilterSchema),z.lazy(() => DH10ApplicationWhereInputSchema) ]).optional().nullable(),
}).strict();

export const UserOrderByWithRelationInputSchema: z.ZodType<Prisma.UserOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  email: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  emailVerified: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  image: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  typeform_response_id: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  role: z.lazy(() => SortOrderSchema).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  qrcode: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  mealsTaken: z.lazy(() => SortOrderSchema).optional(),
  lastMealTaken: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  dH10ApplicationId: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  accounts: z.lazy(() => AccountOrderByRelationAggregateInputSchema).optional(),
  sessions: z.lazy(() => SessionOrderByRelationAggregateInputSchema).optional(),
  hacker: z.lazy(() => ReviewOrderByRelationAggregateInputSchema).optional(),
  reviewer: z.lazy(() => ReviewOrderByRelationAggregateInputSchema).optional(),
  EventLog: z.lazy(() => EventLogOrderByRelationAggregateInputSchema).optional(),
  dh10application: z.lazy(() => DH10ApplicationOrderByWithRelationInputSchema).optional()
}).strict();

export const UserWhereUniqueInputSchema: z.ZodType<Prisma.UserWhereUniqueInput> = z.union([
  z.object({
    id: z.string().cuid(),
    email: z.string(),
    qrcode: z.number().int(),
    dH10ApplicationId: z.string()
  }),
  z.object({
    id: z.string().cuid(),
    email: z.string(),
    qrcode: z.number().int(),
  }),
  z.object({
    id: z.string().cuid(),
    email: z.string(),
    dH10ApplicationId: z.string(),
  }),
  z.object({
    id: z.string().cuid(),
    email: z.string(),
  }),
  z.object({
    id: z.string().cuid(),
    qrcode: z.number().int(),
    dH10ApplicationId: z.string(),
  }),
  z.object({
    id: z.string().cuid(),
    qrcode: z.number().int(),
  }),
  z.object({
    id: z.string().cuid(),
    dH10ApplicationId: z.string(),
  }),
  z.object({
    id: z.string().cuid(),
  }),
  z.object({
    email: z.string(),
    qrcode: z.number().int(),
    dH10ApplicationId: z.string(),
  }),
  z.object({
    email: z.string(),
    qrcode: z.number().int(),
  }),
  z.object({
    email: z.string(),
    dH10ApplicationId: z.string(),
  }),
  z.object({
    email: z.string(),
  }),
  z.object({
    qrcode: z.number().int(),
    dH10ApplicationId: z.string(),
  }),
  z.object({
    qrcode: z.number().int(),
  }),
  z.object({
    dH10ApplicationId: z.string(),
  }),
])
.and(z.object({
  id: z.string().cuid().optional(),
  email: z.string().optional(),
  qrcode: z.number().int().optional(),
  dH10ApplicationId: z.string().optional(),
  AND: z.union([ z.lazy(() => UserWhereInputSchema),z.lazy(() => UserWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => UserWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UserWhereInputSchema),z.lazy(() => UserWhereInputSchema).array() ]).optional(),
  name: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  emailVerified: z.union([ z.lazy(() => DateTimeNullableFilterSchema),z.coerce.date() ]).optional().nullable(),
  image: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  typeform_response_id: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  role: z.lazy(() => EnumRoleNullableListFilterSchema).optional(),
  status: z.union([ z.lazy(() => EnumStatusFilterSchema),z.lazy(() => StatusSchema) ]).optional(),
  mealsTaken: z.union([ z.lazy(() => IntFilterSchema),z.number().int() ]).optional(),
  lastMealTaken: z.union([ z.lazy(() => DateTimeNullableFilterSchema),z.coerce.date() ]).optional().nullable(),
  accounts: z.lazy(() => AccountListRelationFilterSchema).optional(),
  sessions: z.lazy(() => SessionListRelationFilterSchema).optional(),
  hacker: z.lazy(() => ReviewListRelationFilterSchema).optional(),
  reviewer: z.lazy(() => ReviewListRelationFilterSchema).optional(),
  EventLog: z.lazy(() => EventLogListRelationFilterSchema).optional(),
  dh10application: z.union([ z.lazy(() => DH10ApplicationNullableRelationFilterSchema),z.lazy(() => DH10ApplicationWhereInputSchema) ]).optional().nullable(),
}).strict());

export const UserOrderByWithAggregationInputSchema: z.ZodType<Prisma.UserOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  email: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  emailVerified: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  image: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  typeform_response_id: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  role: z.lazy(() => SortOrderSchema).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  qrcode: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  mealsTaken: z.lazy(() => SortOrderSchema).optional(),
  lastMealTaken: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  dH10ApplicationId: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  _count: z.lazy(() => UserCountOrderByAggregateInputSchema).optional(),
  _avg: z.lazy(() => UserAvgOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => UserMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => UserMinOrderByAggregateInputSchema).optional(),
  _sum: z.lazy(() => UserSumOrderByAggregateInputSchema).optional()
}).strict();

export const UserScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.UserScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => UserScalarWhereWithAggregatesInputSchema),z.lazy(() => UserScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => UserScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UserScalarWhereWithAggregatesInputSchema),z.lazy(() => UserScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  name: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  email: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  emailVerified: z.union([ z.lazy(() => DateTimeNullableWithAggregatesFilterSchema),z.coerce.date() ]).optional().nullable(),
  image: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  typeform_response_id: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  role: z.lazy(() => EnumRoleNullableListFilterSchema).optional(),
  status: z.union([ z.lazy(() => EnumStatusWithAggregatesFilterSchema),z.lazy(() => StatusSchema) ]).optional(),
  qrcode: z.union([ z.lazy(() => IntNullableWithAggregatesFilterSchema),z.number() ]).optional().nullable(),
  mealsTaken: z.union([ z.lazy(() => IntWithAggregatesFilterSchema),z.number() ]).optional(),
  lastMealTaken: z.union([ z.lazy(() => DateTimeNullableWithAggregatesFilterSchema),z.coerce.date() ]).optional().nullable(),
  dH10ApplicationId: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
}).strict();

export const ReviewWhereInputSchema: z.ZodType<Prisma.ReviewWhereInput> = z.object({
  AND: z.union([ z.lazy(() => ReviewWhereInputSchema),z.lazy(() => ReviewWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => ReviewWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ReviewWhereInputSchema),z.lazy(() => ReviewWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  hackerId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  reviewerId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  mark: z.union([ z.lazy(() => FloatFilterSchema),z.number() ]).optional(),
  hacker: z.union([ z.lazy(() => UserRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional(),
  reviewer: z.union([ z.lazy(() => UserRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional(),
}).strict();

export const ReviewOrderByWithRelationInputSchema: z.ZodType<Prisma.ReviewOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  hackerId: z.lazy(() => SortOrderSchema).optional(),
  reviewerId: z.lazy(() => SortOrderSchema).optional(),
  mark: z.lazy(() => SortOrderSchema).optional(),
  hacker: z.lazy(() => UserOrderByWithRelationInputSchema).optional(),
  reviewer: z.lazy(() => UserOrderByWithRelationInputSchema).optional()
}).strict();

export const ReviewWhereUniqueInputSchema: z.ZodType<Prisma.ReviewWhereUniqueInput> = z.object({
  id: z.string().cuid()
})
.and(z.object({
  id: z.string().cuid().optional(),
  AND: z.union([ z.lazy(() => ReviewWhereInputSchema),z.lazy(() => ReviewWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => ReviewWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ReviewWhereInputSchema),z.lazy(() => ReviewWhereInputSchema).array() ]).optional(),
  hackerId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  reviewerId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  mark: z.union([ z.lazy(() => FloatFilterSchema),z.number() ]).optional(),
  hacker: z.union([ z.lazy(() => UserRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional(),
  reviewer: z.union([ z.lazy(() => UserRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional(),
}).strict());

export const ReviewOrderByWithAggregationInputSchema: z.ZodType<Prisma.ReviewOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  hackerId: z.lazy(() => SortOrderSchema).optional(),
  reviewerId: z.lazy(() => SortOrderSchema).optional(),
  mark: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => ReviewCountOrderByAggregateInputSchema).optional(),
  _avg: z.lazy(() => ReviewAvgOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => ReviewMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => ReviewMinOrderByAggregateInputSchema).optional(),
  _sum: z.lazy(() => ReviewSumOrderByAggregateInputSchema).optional()
}).strict();

export const ReviewScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.ReviewScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => ReviewScalarWhereWithAggregatesInputSchema),z.lazy(() => ReviewScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => ReviewScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ReviewScalarWhereWithAggregatesInputSchema),z.lazy(() => ReviewScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  hackerId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  reviewerId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  mark: z.union([ z.lazy(() => FloatWithAggregatesFilterSchema),z.number() ]).optional(),
}).strict();

export const EventLogWhereInputSchema: z.ZodType<Prisma.EventLogWhereInput> = z.object({
  AND: z.union([ z.lazy(() => EventLogWhereInputSchema),z.lazy(() => EventLogWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => EventLogWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => EventLogWhereInputSchema),z.lazy(() => EventLogWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  timestamp: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  event: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  user: z.union([ z.lazy(() => UserRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional(),
}).strict();

export const EventLogOrderByWithRelationInputSchema: z.ZodType<Prisma.EventLogOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  timestamp: z.lazy(() => SortOrderSchema).optional(),
  event: z.lazy(() => SortOrderSchema).optional(),
  user: z.lazy(() => UserOrderByWithRelationInputSchema).optional()
}).strict();

export const EventLogWhereUniqueInputSchema: z.ZodType<Prisma.EventLogWhereUniqueInput> = z.object({
  id: z.string().cuid()
})
.and(z.object({
  id: z.string().cuid().optional(),
  AND: z.union([ z.lazy(() => EventLogWhereInputSchema),z.lazy(() => EventLogWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => EventLogWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => EventLogWhereInputSchema),z.lazy(() => EventLogWhereInputSchema).array() ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  timestamp: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  event: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  user: z.union([ z.lazy(() => UserRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional(),
}).strict());

export const EventLogOrderByWithAggregationInputSchema: z.ZodType<Prisma.EventLogOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  timestamp: z.lazy(() => SortOrderSchema).optional(),
  event: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => EventLogCountOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => EventLogMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => EventLogMinOrderByAggregateInputSchema).optional()
}).strict();

export const EventLogScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.EventLogScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => EventLogScalarWhereWithAggregatesInputSchema),z.lazy(() => EventLogScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => EventLogScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => EventLogScalarWhereWithAggregatesInputSchema),z.lazy(() => EventLogScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  timestamp: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
  event: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
}).strict();

export const VerificationTokenWhereInputSchema: z.ZodType<Prisma.VerificationTokenWhereInput> = z.object({
  AND: z.union([ z.lazy(() => VerificationTokenWhereInputSchema),z.lazy(() => VerificationTokenWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => VerificationTokenWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => VerificationTokenWhereInputSchema),z.lazy(() => VerificationTokenWhereInputSchema).array() ]).optional(),
  identifier: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  token: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  expires: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
}).strict();

export const VerificationTokenOrderByWithRelationInputSchema: z.ZodType<Prisma.VerificationTokenOrderByWithRelationInput> = z.object({
  identifier: z.lazy(() => SortOrderSchema).optional(),
  token: z.lazy(() => SortOrderSchema).optional(),
  expires: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const VerificationTokenWhereUniqueInputSchema: z.ZodType<Prisma.VerificationTokenWhereUniqueInput> = z.union([
  z.object({
    token: z.string(),
    identifier_token: z.lazy(() => VerificationTokenIdentifierTokenCompoundUniqueInputSchema)
  }),
  z.object({
    token: z.string(),
  }),
  z.object({
    identifier_token: z.lazy(() => VerificationTokenIdentifierTokenCompoundUniqueInputSchema),
  }),
])
.and(z.object({
  token: z.string().optional(),
  identifier_token: z.lazy(() => VerificationTokenIdentifierTokenCompoundUniqueInputSchema).optional(),
  AND: z.union([ z.lazy(() => VerificationTokenWhereInputSchema),z.lazy(() => VerificationTokenWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => VerificationTokenWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => VerificationTokenWhereInputSchema),z.lazy(() => VerificationTokenWhereInputSchema).array() ]).optional(),
  identifier: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  expires: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
}).strict());

export const VerificationTokenOrderByWithAggregationInputSchema: z.ZodType<Prisma.VerificationTokenOrderByWithAggregationInput> = z.object({
  identifier: z.lazy(() => SortOrderSchema).optional(),
  token: z.lazy(() => SortOrderSchema).optional(),
  expires: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => VerificationTokenCountOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => VerificationTokenMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => VerificationTokenMinOrderByAggregateInputSchema).optional()
}).strict();

export const VerificationTokenScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.VerificationTokenScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => VerificationTokenScalarWhereWithAggregatesInputSchema),z.lazy(() => VerificationTokenScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => VerificationTokenScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => VerificationTokenScalarWhereWithAggregatesInputSchema),z.lazy(() => VerificationTokenScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  identifier: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  token: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  expires: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
}).strict();

export const DH10ApplicationWhereInputSchema: z.ZodType<Prisma.DH10ApplicationWhereInput> = z.object({
  AND: z.union([ z.lazy(() => DH10ApplicationWhereInputSchema),z.lazy(() => DH10ApplicationWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => DH10ApplicationWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => DH10ApplicationWhereInputSchema),z.lazy(() => DH10ApplicationWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  firstName: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  lastName: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  birthday: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  studyEnrolledPostSecondary: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  studyLocation: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  studyDegree: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  studyMajor: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  studyYearOfStudy: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  studyExpectedGraduation: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  previousHackathonsCount: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  longAnswerChange: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  longAnswerExperience: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  longAnswerTech: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  longAnswerMeaning: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  longAnswerFuture: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  longAnswerMagic: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  socialText: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  interests: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  tshirtSize: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  hackerKind: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  alreadyHaveTeam: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  workshopChoices: z.lazy(() => StringNullableListFilterSchema).optional(),
  considerCoffee: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  discoverdFrom: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  gender: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  race: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  emergencyContactName: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  emergencyContactPhone: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  emergencyContactRelation: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  agreeToMLHCodeOfConduct: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  agreeToMLHPrivacyPolicy: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  agreeToMLHCommunications: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  User: z.union([ z.lazy(() => UserNullableRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional().nullable(),
}).strict();

export const DH10ApplicationOrderByWithRelationInputSchema: z.ZodType<Prisma.DH10ApplicationOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  firstName: z.lazy(() => SortOrderSchema).optional(),
  lastName: z.lazy(() => SortOrderSchema).optional(),
  birthday: z.lazy(() => SortOrderSchema).optional(),
  studyEnrolledPostSecondary: z.lazy(() => SortOrderSchema).optional(),
  studyLocation: z.lazy(() => SortOrderSchema).optional(),
  studyDegree: z.lazy(() => SortOrderSchema).optional(),
  studyMajor: z.lazy(() => SortOrderSchema).optional(),
  studyYearOfStudy: z.lazy(() => SortOrderSchema).optional(),
  studyExpectedGraduation: z.lazy(() => SortOrderSchema).optional(),
  previousHackathonsCount: z.lazy(() => SortOrderSchema).optional(),
  longAnswerChange: z.lazy(() => SortOrderSchema).optional(),
  longAnswerExperience: z.lazy(() => SortOrderSchema).optional(),
  longAnswerTech: z.lazy(() => SortOrderSchema).optional(),
  longAnswerMeaning: z.lazy(() => SortOrderSchema).optional(),
  longAnswerFuture: z.lazy(() => SortOrderSchema).optional(),
  longAnswerMagic: z.lazy(() => SortOrderSchema).optional(),
  socialText: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  interests: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  tshirtSize: z.lazy(() => SortOrderSchema).optional(),
  hackerKind: z.lazy(() => SortOrderSchema).optional(),
  alreadyHaveTeam: z.lazy(() => SortOrderSchema).optional(),
  workshopChoices: z.lazy(() => SortOrderSchema).optional(),
  considerCoffee: z.lazy(() => SortOrderSchema).optional(),
  discoverdFrom: z.lazy(() => SortOrderSchema).optional(),
  gender: z.lazy(() => SortOrderSchema).optional(),
  race: z.lazy(() => SortOrderSchema).optional(),
  emergencyContactName: z.lazy(() => SortOrderSchema).optional(),
  emergencyContactPhone: z.lazy(() => SortOrderSchema).optional(),
  emergencyContactRelation: z.lazy(() => SortOrderSchema).optional(),
  agreeToMLHCodeOfConduct: z.lazy(() => SortOrderSchema).optional(),
  agreeToMLHPrivacyPolicy: z.lazy(() => SortOrderSchema).optional(),
  agreeToMLHCommunications: z.lazy(() => SortOrderSchema).optional(),
  User: z.lazy(() => UserOrderByWithRelationInputSchema).optional()
}).strict();

export const DH10ApplicationWhereUniqueInputSchema: z.ZodType<Prisma.DH10ApplicationWhereUniqueInput> = z.object({
  id: z.string().cuid()
})
.and(z.object({
  id: z.string().cuid().optional(),
  AND: z.union([ z.lazy(() => DH10ApplicationWhereInputSchema),z.lazy(() => DH10ApplicationWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => DH10ApplicationWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => DH10ApplicationWhereInputSchema),z.lazy(() => DH10ApplicationWhereInputSchema).array() ]).optional(),
  firstName: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  lastName: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  birthday: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  studyEnrolledPostSecondary: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  studyLocation: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  studyDegree: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  studyMajor: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  studyYearOfStudy: z.union([ z.lazy(() => IntFilterSchema),z.number().int() ]).optional(),
  studyExpectedGraduation: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  previousHackathonsCount: z.union([ z.lazy(() => IntFilterSchema),z.number().int() ]).optional(),
  longAnswerChange: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  longAnswerExperience: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  longAnswerTech: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  longAnswerMeaning: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  longAnswerFuture: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  longAnswerMagic: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  socialText: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  interests: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  tshirtSize: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  hackerKind: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  alreadyHaveTeam: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  workshopChoices: z.lazy(() => StringNullableListFilterSchema).optional(),
  considerCoffee: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  discoverdFrom: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  gender: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  race: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  emergencyContactName: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  emergencyContactPhone: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  emergencyContactRelation: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  agreeToMLHCodeOfConduct: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  agreeToMLHPrivacyPolicy: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  agreeToMLHCommunications: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  User: z.union([ z.lazy(() => UserNullableRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional().nullable(),
}).strict());

export const DH10ApplicationOrderByWithAggregationInputSchema: z.ZodType<Prisma.DH10ApplicationOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  firstName: z.lazy(() => SortOrderSchema).optional(),
  lastName: z.lazy(() => SortOrderSchema).optional(),
  birthday: z.lazy(() => SortOrderSchema).optional(),
  studyEnrolledPostSecondary: z.lazy(() => SortOrderSchema).optional(),
  studyLocation: z.lazy(() => SortOrderSchema).optional(),
  studyDegree: z.lazy(() => SortOrderSchema).optional(),
  studyMajor: z.lazy(() => SortOrderSchema).optional(),
  studyYearOfStudy: z.lazy(() => SortOrderSchema).optional(),
  studyExpectedGraduation: z.lazy(() => SortOrderSchema).optional(),
  previousHackathonsCount: z.lazy(() => SortOrderSchema).optional(),
  longAnswerChange: z.lazy(() => SortOrderSchema).optional(),
  longAnswerExperience: z.lazy(() => SortOrderSchema).optional(),
  longAnswerTech: z.lazy(() => SortOrderSchema).optional(),
  longAnswerMeaning: z.lazy(() => SortOrderSchema).optional(),
  longAnswerFuture: z.lazy(() => SortOrderSchema).optional(),
  longAnswerMagic: z.lazy(() => SortOrderSchema).optional(),
  socialText: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  interests: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  tshirtSize: z.lazy(() => SortOrderSchema).optional(),
  hackerKind: z.lazy(() => SortOrderSchema).optional(),
  alreadyHaveTeam: z.lazy(() => SortOrderSchema).optional(),
  workshopChoices: z.lazy(() => SortOrderSchema).optional(),
  considerCoffee: z.lazy(() => SortOrderSchema).optional(),
  discoverdFrom: z.lazy(() => SortOrderSchema).optional(),
  gender: z.lazy(() => SortOrderSchema).optional(),
  race: z.lazy(() => SortOrderSchema).optional(),
  emergencyContactName: z.lazy(() => SortOrderSchema).optional(),
  emergencyContactPhone: z.lazy(() => SortOrderSchema).optional(),
  emergencyContactRelation: z.lazy(() => SortOrderSchema).optional(),
  agreeToMLHCodeOfConduct: z.lazy(() => SortOrderSchema).optional(),
  agreeToMLHPrivacyPolicy: z.lazy(() => SortOrderSchema).optional(),
  agreeToMLHCommunications: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => DH10ApplicationCountOrderByAggregateInputSchema).optional(),
  _avg: z.lazy(() => DH10ApplicationAvgOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => DH10ApplicationMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => DH10ApplicationMinOrderByAggregateInputSchema).optional(),
  _sum: z.lazy(() => DH10ApplicationSumOrderByAggregateInputSchema).optional()
}).strict();

export const DH10ApplicationScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.DH10ApplicationScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => DH10ApplicationScalarWhereWithAggregatesInputSchema),z.lazy(() => DH10ApplicationScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => DH10ApplicationScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => DH10ApplicationScalarWhereWithAggregatesInputSchema),z.lazy(() => DH10ApplicationScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  firstName: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  lastName: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  birthday: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
  studyEnrolledPostSecondary: z.union([ z.lazy(() => BoolWithAggregatesFilterSchema),z.boolean() ]).optional(),
  studyLocation: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  studyDegree: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  studyMajor: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  studyYearOfStudy: z.union([ z.lazy(() => IntWithAggregatesFilterSchema),z.number() ]).optional(),
  studyExpectedGraduation: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
  previousHackathonsCount: z.union([ z.lazy(() => IntWithAggregatesFilterSchema),z.number() ]).optional(),
  longAnswerChange: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  longAnswerExperience: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  longAnswerTech: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  longAnswerMeaning: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  longAnswerFuture: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  longAnswerMagic: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  socialText: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  interests: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  tshirtSize: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  hackerKind: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  alreadyHaveTeam: z.union([ z.lazy(() => BoolWithAggregatesFilterSchema),z.boolean() ]).optional(),
  workshopChoices: z.lazy(() => StringNullableListFilterSchema).optional(),
  considerCoffee: z.union([ z.lazy(() => BoolWithAggregatesFilterSchema),z.boolean() ]).optional(),
  discoverdFrom: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  gender: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  race: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  emergencyContactName: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  emergencyContactPhone: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  emergencyContactRelation: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  agreeToMLHCodeOfConduct: z.union([ z.lazy(() => BoolWithAggregatesFilterSchema),z.boolean() ]).optional(),
  agreeToMLHPrivacyPolicy: z.union([ z.lazy(() => BoolWithAggregatesFilterSchema),z.boolean() ]).optional(),
  agreeToMLHCommunications: z.union([ z.lazy(() => BoolWithAggregatesFilterSchema),z.boolean() ]).optional(),
}).strict();

export const AccountCreateInputSchema: z.ZodType<Prisma.AccountCreateInput> = z.object({
  id: z.string().cuid().optional(),
  type: z.string(),
  provider: z.string(),
  providerAccountId: z.string(),
  refresh_token: z.string().optional().nullable(),
  refresh_token_expires_in: z.number().int().optional().nullable(),
  access_token: z.string().optional().nullable(),
  expires_at: z.number().int().optional().nullable(),
  ext_expires_in: z.number().int().optional().nullable(),
  oauth_token_secret: z.string().optional().nullable(),
  oauth_token: z.string().optional().nullable(),
  token_type: z.string().optional().nullable(),
  scope: z.string().optional().nullable(),
  id_token: z.string().optional().nullable(),
  session_state: z.string().optional().nullable(),
  user: z.lazy(() => UserCreateNestedOneWithoutAccountsInputSchema)
}).strict();

export const AccountUncheckedCreateInputSchema: z.ZodType<Prisma.AccountUncheckedCreateInput> = z.object({
  id: z.string().cuid().optional(),
  userId: z.string(),
  type: z.string(),
  provider: z.string(),
  providerAccountId: z.string(),
  refresh_token: z.string().optional().nullable(),
  refresh_token_expires_in: z.number().int().optional().nullable(),
  access_token: z.string().optional().nullable(),
  expires_at: z.number().int().optional().nullable(),
  ext_expires_in: z.number().int().optional().nullable(),
  oauth_token_secret: z.string().optional().nullable(),
  oauth_token: z.string().optional().nullable(),
  token_type: z.string().optional().nullable(),
  scope: z.string().optional().nullable(),
  id_token: z.string().optional().nullable(),
  session_state: z.string().optional().nullable()
}).strict();

export const AccountUpdateInputSchema: z.ZodType<Prisma.AccountUpdateInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  provider: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  providerAccountId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  refresh_token: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  refresh_token_expires_in: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  access_token: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  expires_at: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  ext_expires_in: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  oauth_token_secret: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  oauth_token: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  token_type: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  scope: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  id_token: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  session_state: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  user: z.lazy(() => UserUpdateOneRequiredWithoutAccountsNestedInputSchema).optional()
}).strict();

export const AccountUncheckedUpdateInputSchema: z.ZodType<Prisma.AccountUncheckedUpdateInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  provider: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  providerAccountId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  refresh_token: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  refresh_token_expires_in: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  access_token: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  expires_at: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  ext_expires_in: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  oauth_token_secret: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  oauth_token: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  token_type: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  scope: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  id_token: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  session_state: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
}).strict();

export const AccountCreateManyInputSchema: z.ZodType<Prisma.AccountCreateManyInput> = z.object({
  id: z.string().cuid().optional(),
  userId: z.string(),
  type: z.string(),
  provider: z.string(),
  providerAccountId: z.string(),
  refresh_token: z.string().optional().nullable(),
  refresh_token_expires_in: z.number().int().optional().nullable(),
  access_token: z.string().optional().nullable(),
  expires_at: z.number().int().optional().nullable(),
  ext_expires_in: z.number().int().optional().nullable(),
  oauth_token_secret: z.string().optional().nullable(),
  oauth_token: z.string().optional().nullable(),
  token_type: z.string().optional().nullable(),
  scope: z.string().optional().nullable(),
  id_token: z.string().optional().nullable(),
  session_state: z.string().optional().nullable()
}).strict();

export const AccountUpdateManyMutationInputSchema: z.ZodType<Prisma.AccountUpdateManyMutationInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  provider: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  providerAccountId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  refresh_token: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  refresh_token_expires_in: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  access_token: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  expires_at: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  ext_expires_in: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  oauth_token_secret: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  oauth_token: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  token_type: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  scope: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  id_token: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  session_state: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
}).strict();

export const AccountUncheckedUpdateManyInputSchema: z.ZodType<Prisma.AccountUncheckedUpdateManyInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  provider: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  providerAccountId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  refresh_token: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  refresh_token_expires_in: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  access_token: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  expires_at: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  ext_expires_in: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  oauth_token_secret: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  oauth_token: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  token_type: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  scope: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  id_token: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  session_state: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
}).strict();

export const SessionCreateInputSchema: z.ZodType<Prisma.SessionCreateInput> = z.object({
  id: z.string().cuid().optional(),
  sessionToken: z.string(),
  expires: z.coerce.date(),
  user: z.lazy(() => UserCreateNestedOneWithoutSessionsInputSchema)
}).strict();

export const SessionUncheckedCreateInputSchema: z.ZodType<Prisma.SessionUncheckedCreateInput> = z.object({
  id: z.string().cuid().optional(),
  sessionToken: z.string(),
  userId: z.string(),
  expires: z.coerce.date()
}).strict();

export const SessionUpdateInputSchema: z.ZodType<Prisma.SessionUpdateInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  sessionToken: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  expires: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  user: z.lazy(() => UserUpdateOneRequiredWithoutSessionsNestedInputSchema).optional()
}).strict();

export const SessionUncheckedUpdateInputSchema: z.ZodType<Prisma.SessionUncheckedUpdateInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  sessionToken: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  expires: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const SessionCreateManyInputSchema: z.ZodType<Prisma.SessionCreateManyInput> = z.object({
  id: z.string().cuid().optional(),
  sessionToken: z.string(),
  userId: z.string(),
  expires: z.coerce.date()
}).strict();

export const SessionUpdateManyMutationInputSchema: z.ZodType<Prisma.SessionUpdateManyMutationInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  sessionToken: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  expires: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const SessionUncheckedUpdateManyInputSchema: z.ZodType<Prisma.SessionUncheckedUpdateManyInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  sessionToken: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  expires: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const UserCreateInputSchema: z.ZodType<Prisma.UserCreateInput> = z.object({
  id: z.string().cuid().optional(),
  name: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  emailVerified: z.coerce.date().optional().nullable(),
  image: z.string().optional().nullable(),
  typeform_response_id: z.string().optional().nullable(),
  role: z.union([ z.lazy(() => UserCreateroleInputSchema),z.lazy(() => RoleSchema).array() ]).optional(),
  status: z.lazy(() => StatusSchema).optional(),
  qrcode: z.number().int().optional().nullable(),
  mealsTaken: z.number().int().optional(),
  lastMealTaken: z.coerce.date().optional().nullable(),
  accounts: z.lazy(() => AccountCreateNestedManyWithoutUserInputSchema).optional(),
  sessions: z.lazy(() => SessionCreateNestedManyWithoutUserInputSchema).optional(),
  hacker: z.lazy(() => ReviewCreateNestedManyWithoutHackerInputSchema).optional(),
  reviewer: z.lazy(() => ReviewCreateNestedManyWithoutReviewerInputSchema).optional(),
  EventLog: z.lazy(() => EventLogCreateNestedManyWithoutUserInputSchema).optional(),
  dh10application: z.lazy(() => DH10ApplicationCreateNestedOneWithoutUserInputSchema).optional()
}).strict();

export const UserUncheckedCreateInputSchema: z.ZodType<Prisma.UserUncheckedCreateInput> = z.object({
  id: z.string().cuid().optional(),
  name: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  emailVerified: z.coerce.date().optional().nullable(),
  image: z.string().optional().nullable(),
  typeform_response_id: z.string().optional().nullable(),
  role: z.union([ z.lazy(() => UserCreateroleInputSchema),z.lazy(() => RoleSchema).array() ]).optional(),
  status: z.lazy(() => StatusSchema).optional(),
  qrcode: z.number().int().optional().nullable(),
  mealsTaken: z.number().int().optional(),
  lastMealTaken: z.coerce.date().optional().nullable(),
  dH10ApplicationId: z.string().optional().nullable(),
  accounts: z.lazy(() => AccountUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  sessions: z.lazy(() => SessionUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  hacker: z.lazy(() => ReviewUncheckedCreateNestedManyWithoutHackerInputSchema).optional(),
  reviewer: z.lazy(() => ReviewUncheckedCreateNestedManyWithoutReviewerInputSchema).optional(),
  EventLog: z.lazy(() => EventLogUncheckedCreateNestedManyWithoutUserInputSchema).optional()
}).strict();

export const UserUpdateInputSchema: z.ZodType<Prisma.UserUpdateInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  email: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  emailVerified: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  image: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  typeform_response_id: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  role: z.union([ z.lazy(() => UserUpdateroleInputSchema),z.lazy(() => RoleSchema).array() ]).optional(),
  status: z.union([ z.lazy(() => StatusSchema),z.lazy(() => EnumStatusFieldUpdateOperationsInputSchema) ]).optional(),
  qrcode: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  mealsTaken: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  lastMealTaken: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  accounts: z.lazy(() => AccountUpdateManyWithoutUserNestedInputSchema).optional(),
  sessions: z.lazy(() => SessionUpdateManyWithoutUserNestedInputSchema).optional(),
  hacker: z.lazy(() => ReviewUpdateManyWithoutHackerNestedInputSchema).optional(),
  reviewer: z.lazy(() => ReviewUpdateManyWithoutReviewerNestedInputSchema).optional(),
  EventLog: z.lazy(() => EventLogUpdateManyWithoutUserNestedInputSchema).optional(),
  dh10application: z.lazy(() => DH10ApplicationUpdateOneWithoutUserNestedInputSchema).optional()
}).strict();

export const UserUncheckedUpdateInputSchema: z.ZodType<Prisma.UserUncheckedUpdateInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  email: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  emailVerified: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  image: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  typeform_response_id: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  role: z.union([ z.lazy(() => UserUpdateroleInputSchema),z.lazy(() => RoleSchema).array() ]).optional(),
  status: z.union([ z.lazy(() => StatusSchema),z.lazy(() => EnumStatusFieldUpdateOperationsInputSchema) ]).optional(),
  qrcode: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  mealsTaken: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  lastMealTaken: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  dH10ApplicationId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  accounts: z.lazy(() => AccountUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  sessions: z.lazy(() => SessionUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  hacker: z.lazy(() => ReviewUncheckedUpdateManyWithoutHackerNestedInputSchema).optional(),
  reviewer: z.lazy(() => ReviewUncheckedUpdateManyWithoutReviewerNestedInputSchema).optional(),
  EventLog: z.lazy(() => EventLogUncheckedUpdateManyWithoutUserNestedInputSchema).optional()
}).strict();

export const UserCreateManyInputSchema: z.ZodType<Prisma.UserCreateManyInput> = z.object({
  id: z.string().cuid().optional(),
  name: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  emailVerified: z.coerce.date().optional().nullable(),
  image: z.string().optional().nullable(),
  typeform_response_id: z.string().optional().nullable(),
  role: z.union([ z.lazy(() => UserCreateroleInputSchema),z.lazy(() => RoleSchema).array() ]).optional(),
  status: z.lazy(() => StatusSchema).optional(),
  qrcode: z.number().int().optional().nullable(),
  mealsTaken: z.number().int().optional(),
  lastMealTaken: z.coerce.date().optional().nullable(),
  dH10ApplicationId: z.string().optional().nullable()
}).strict();

export const UserUpdateManyMutationInputSchema: z.ZodType<Prisma.UserUpdateManyMutationInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  email: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  emailVerified: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  image: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  typeform_response_id: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  role: z.union([ z.lazy(() => UserUpdateroleInputSchema),z.lazy(() => RoleSchema).array() ]).optional(),
  status: z.union([ z.lazy(() => StatusSchema),z.lazy(() => EnumStatusFieldUpdateOperationsInputSchema) ]).optional(),
  qrcode: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  mealsTaken: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  lastMealTaken: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
}).strict();

export const UserUncheckedUpdateManyInputSchema: z.ZodType<Prisma.UserUncheckedUpdateManyInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  email: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  emailVerified: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  image: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  typeform_response_id: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  role: z.union([ z.lazy(() => UserUpdateroleInputSchema),z.lazy(() => RoleSchema).array() ]).optional(),
  status: z.union([ z.lazy(() => StatusSchema),z.lazy(() => EnumStatusFieldUpdateOperationsInputSchema) ]).optional(),
  qrcode: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  mealsTaken: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  lastMealTaken: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  dH10ApplicationId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
}).strict();

export const ReviewCreateInputSchema: z.ZodType<Prisma.ReviewCreateInput> = z.object({
  id: z.string().cuid().optional(),
  mark: z.number().optional(),
  hacker: z.lazy(() => UserCreateNestedOneWithoutHackerInputSchema),
  reviewer: z.lazy(() => UserCreateNestedOneWithoutReviewerInputSchema)
}).strict();

export const ReviewUncheckedCreateInputSchema: z.ZodType<Prisma.ReviewUncheckedCreateInput> = z.object({
  id: z.string().cuid().optional(),
  hackerId: z.string(),
  reviewerId: z.string(),
  mark: z.number().optional()
}).strict();

export const ReviewUpdateInputSchema: z.ZodType<Prisma.ReviewUpdateInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  mark: z.union([ z.number(),z.lazy(() => FloatFieldUpdateOperationsInputSchema) ]).optional(),
  hacker: z.lazy(() => UserUpdateOneRequiredWithoutHackerNestedInputSchema).optional(),
  reviewer: z.lazy(() => UserUpdateOneRequiredWithoutReviewerNestedInputSchema).optional()
}).strict();

export const ReviewUncheckedUpdateInputSchema: z.ZodType<Prisma.ReviewUncheckedUpdateInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  hackerId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  reviewerId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  mark: z.union([ z.number(),z.lazy(() => FloatFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const ReviewCreateManyInputSchema: z.ZodType<Prisma.ReviewCreateManyInput> = z.object({
  id: z.string().cuid().optional(),
  hackerId: z.string(),
  reviewerId: z.string(),
  mark: z.number().optional()
}).strict();

export const ReviewUpdateManyMutationInputSchema: z.ZodType<Prisma.ReviewUpdateManyMutationInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  mark: z.union([ z.number(),z.lazy(() => FloatFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const ReviewUncheckedUpdateManyInputSchema: z.ZodType<Prisma.ReviewUncheckedUpdateManyInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  hackerId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  reviewerId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  mark: z.union([ z.number(),z.lazy(() => FloatFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const EventLogCreateInputSchema: z.ZodType<Prisma.EventLogCreateInput> = z.object({
  id: z.string().cuid().optional(),
  timestamp: z.coerce.date().optional(),
  event: z.string(),
  user: z.lazy(() => UserCreateNestedOneWithoutEventLogInputSchema)
}).strict();

export const EventLogUncheckedCreateInputSchema: z.ZodType<Prisma.EventLogUncheckedCreateInput> = z.object({
  id: z.string().cuid().optional(),
  userId: z.string(),
  timestamp: z.coerce.date().optional(),
  event: z.string()
}).strict();

export const EventLogUpdateInputSchema: z.ZodType<Prisma.EventLogUpdateInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  timestamp: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  event: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  user: z.lazy(() => UserUpdateOneRequiredWithoutEventLogNestedInputSchema).optional()
}).strict();

export const EventLogUncheckedUpdateInputSchema: z.ZodType<Prisma.EventLogUncheckedUpdateInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  timestamp: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  event: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const EventLogCreateManyInputSchema: z.ZodType<Prisma.EventLogCreateManyInput> = z.object({
  id: z.string().cuid().optional(),
  userId: z.string(),
  timestamp: z.coerce.date().optional(),
  event: z.string()
}).strict();

export const EventLogUpdateManyMutationInputSchema: z.ZodType<Prisma.EventLogUpdateManyMutationInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  timestamp: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  event: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const EventLogUncheckedUpdateManyInputSchema: z.ZodType<Prisma.EventLogUncheckedUpdateManyInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  timestamp: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  event: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const VerificationTokenCreateInputSchema: z.ZodType<Prisma.VerificationTokenCreateInput> = z.object({
  identifier: z.string(),
  token: z.string(),
  expires: z.coerce.date()
}).strict();

export const VerificationTokenUncheckedCreateInputSchema: z.ZodType<Prisma.VerificationTokenUncheckedCreateInput> = z.object({
  identifier: z.string(),
  token: z.string(),
  expires: z.coerce.date()
}).strict();

export const VerificationTokenUpdateInputSchema: z.ZodType<Prisma.VerificationTokenUpdateInput> = z.object({
  identifier: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  token: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  expires: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const VerificationTokenUncheckedUpdateInputSchema: z.ZodType<Prisma.VerificationTokenUncheckedUpdateInput> = z.object({
  identifier: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  token: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  expires: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const VerificationTokenCreateManyInputSchema: z.ZodType<Prisma.VerificationTokenCreateManyInput> = z.object({
  identifier: z.string(),
  token: z.string(),
  expires: z.coerce.date()
}).strict();

export const VerificationTokenUpdateManyMutationInputSchema: z.ZodType<Prisma.VerificationTokenUpdateManyMutationInput> = z.object({
  identifier: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  token: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  expires: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const VerificationTokenUncheckedUpdateManyInputSchema: z.ZodType<Prisma.VerificationTokenUncheckedUpdateManyInput> = z.object({
  identifier: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  token: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  expires: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const DH10ApplicationCreateInputSchema: z.ZodType<Prisma.DH10ApplicationCreateInput> = z.object({
  id: z.string().cuid().optional(),
  firstName: z.string(),
  lastName: z.string(),
  birthday: z.coerce.date(),
  studyEnrolledPostSecondary: z.boolean(),
  studyLocation: z.string(),
  studyDegree: z.string(),
  studyMajor: z.string(),
  studyYearOfStudy: z.number().int(),
  studyExpectedGraduation: z.coerce.date(),
  previousHackathonsCount: z.number().int(),
  longAnswerChange: z.string(),
  longAnswerExperience: z.string(),
  longAnswerTech: z.string(),
  longAnswerMeaning: z.string(),
  longAnswerFuture: z.string(),
  longAnswerMagic: z.string(),
  socialText: z.string().optional().nullable(),
  interests: z.string().optional().nullable(),
  tshirtSize: z.string(),
  hackerKind: z.string(),
  alreadyHaveTeam: z.boolean(),
  workshopChoices: z.union([ z.lazy(() => DH10ApplicationCreateworkshopChoicesInputSchema),z.string().array() ]).optional(),
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
  User: z.lazy(() => UserCreateNestedOneWithoutDh10applicationInputSchema).optional()
}).strict();

export const DH10ApplicationUncheckedCreateInputSchema: z.ZodType<Prisma.DH10ApplicationUncheckedCreateInput> = z.object({
  id: z.string().cuid().optional(),
  firstName: z.string(),
  lastName: z.string(),
  birthday: z.coerce.date(),
  studyEnrolledPostSecondary: z.boolean(),
  studyLocation: z.string(),
  studyDegree: z.string(),
  studyMajor: z.string(),
  studyYearOfStudy: z.number().int(),
  studyExpectedGraduation: z.coerce.date(),
  previousHackathonsCount: z.number().int(),
  longAnswerChange: z.string(),
  longAnswerExperience: z.string(),
  longAnswerTech: z.string(),
  longAnswerMeaning: z.string(),
  longAnswerFuture: z.string(),
  longAnswerMagic: z.string(),
  socialText: z.string().optional().nullable(),
  interests: z.string().optional().nullable(),
  tshirtSize: z.string(),
  hackerKind: z.string(),
  alreadyHaveTeam: z.boolean(),
  workshopChoices: z.union([ z.lazy(() => DH10ApplicationCreateworkshopChoicesInputSchema),z.string().array() ]).optional(),
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
  User: z.lazy(() => UserUncheckedCreateNestedOneWithoutDh10applicationInputSchema).optional()
}).strict();

export const DH10ApplicationUpdateInputSchema: z.ZodType<Prisma.DH10ApplicationUpdateInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  firstName: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  lastName: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  birthday: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  studyEnrolledPostSecondary: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  studyLocation: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  studyDegree: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  studyMajor: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  studyYearOfStudy: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  studyExpectedGraduation: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  previousHackathonsCount: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  longAnswerChange: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  longAnswerExperience: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  longAnswerTech: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  longAnswerMeaning: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  longAnswerFuture: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  longAnswerMagic: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  socialText: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  interests: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  tshirtSize: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  hackerKind: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  alreadyHaveTeam: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  workshopChoices: z.union([ z.lazy(() => DH10ApplicationUpdateworkshopChoicesInputSchema),z.string().array() ]).optional(),
  considerCoffee: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  discoverdFrom: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  gender: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  race: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  emergencyContactName: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  emergencyContactPhone: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  emergencyContactRelation: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  agreeToMLHCodeOfConduct: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  agreeToMLHPrivacyPolicy: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  agreeToMLHCommunications: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  User: z.lazy(() => UserUpdateOneWithoutDh10applicationNestedInputSchema).optional()
}).strict();

export const DH10ApplicationUncheckedUpdateInputSchema: z.ZodType<Prisma.DH10ApplicationUncheckedUpdateInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  firstName: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  lastName: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  birthday: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  studyEnrolledPostSecondary: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  studyLocation: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  studyDegree: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  studyMajor: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  studyYearOfStudy: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  studyExpectedGraduation: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  previousHackathonsCount: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  longAnswerChange: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  longAnswerExperience: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  longAnswerTech: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  longAnswerMeaning: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  longAnswerFuture: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  longAnswerMagic: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  socialText: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  interests: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  tshirtSize: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  hackerKind: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  alreadyHaveTeam: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  workshopChoices: z.union([ z.lazy(() => DH10ApplicationUpdateworkshopChoicesInputSchema),z.string().array() ]).optional(),
  considerCoffee: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  discoverdFrom: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  gender: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  race: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  emergencyContactName: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  emergencyContactPhone: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  emergencyContactRelation: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  agreeToMLHCodeOfConduct: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  agreeToMLHPrivacyPolicy: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  agreeToMLHCommunications: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  User: z.lazy(() => UserUncheckedUpdateOneWithoutDh10applicationNestedInputSchema).optional()
}).strict();

export const DH10ApplicationCreateManyInputSchema: z.ZodType<Prisma.DH10ApplicationCreateManyInput> = z.object({
  id: z.string().cuid().optional(),
  firstName: z.string(),
  lastName: z.string(),
  birthday: z.coerce.date(),
  studyEnrolledPostSecondary: z.boolean(),
  studyLocation: z.string(),
  studyDegree: z.string(),
  studyMajor: z.string(),
  studyYearOfStudy: z.number().int(),
  studyExpectedGraduation: z.coerce.date(),
  previousHackathonsCount: z.number().int(),
  longAnswerChange: z.string(),
  longAnswerExperience: z.string(),
  longAnswerTech: z.string(),
  longAnswerMeaning: z.string(),
  longAnswerFuture: z.string(),
  longAnswerMagic: z.string(),
  socialText: z.string().optional().nullable(),
  interests: z.string().optional().nullable(),
  tshirtSize: z.string(),
  hackerKind: z.string(),
  alreadyHaveTeam: z.boolean(),
  workshopChoices: z.union([ z.lazy(() => DH10ApplicationCreateworkshopChoicesInputSchema),z.string().array() ]).optional(),
  considerCoffee: z.boolean(),
  discoverdFrom: z.string(),
  gender: z.string(),
  race: z.string(),
  emergencyContactName: z.string(),
  emergencyContactPhone: z.string(),
  emergencyContactRelation: z.string(),
  agreeToMLHCodeOfConduct: z.boolean(),
  agreeToMLHPrivacyPolicy: z.boolean(),
  agreeToMLHCommunications: z.boolean()
}).strict();

export const DH10ApplicationUpdateManyMutationInputSchema: z.ZodType<Prisma.DH10ApplicationUpdateManyMutationInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  firstName: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  lastName: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  birthday: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  studyEnrolledPostSecondary: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  studyLocation: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  studyDegree: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  studyMajor: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  studyYearOfStudy: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  studyExpectedGraduation: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  previousHackathonsCount: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  longAnswerChange: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  longAnswerExperience: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  longAnswerTech: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  longAnswerMeaning: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  longAnswerFuture: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  longAnswerMagic: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  socialText: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  interests: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  tshirtSize: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  hackerKind: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  alreadyHaveTeam: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  workshopChoices: z.union([ z.lazy(() => DH10ApplicationUpdateworkshopChoicesInputSchema),z.string().array() ]).optional(),
  considerCoffee: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  discoverdFrom: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  gender: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  race: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  emergencyContactName: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  emergencyContactPhone: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  emergencyContactRelation: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  agreeToMLHCodeOfConduct: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  agreeToMLHPrivacyPolicy: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  agreeToMLHCommunications: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const DH10ApplicationUncheckedUpdateManyInputSchema: z.ZodType<Prisma.DH10ApplicationUncheckedUpdateManyInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  firstName: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  lastName: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  birthday: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  studyEnrolledPostSecondary: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  studyLocation: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  studyDegree: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  studyMajor: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  studyYearOfStudy: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  studyExpectedGraduation: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  previousHackathonsCount: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  longAnswerChange: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  longAnswerExperience: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  longAnswerTech: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  longAnswerMeaning: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  longAnswerFuture: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  longAnswerMagic: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  socialText: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  interests: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  tshirtSize: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  hackerKind: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  alreadyHaveTeam: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  workshopChoices: z.union([ z.lazy(() => DH10ApplicationUpdateworkshopChoicesInputSchema),z.string().array() ]).optional(),
  considerCoffee: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  discoverdFrom: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  gender: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  race: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  emergencyContactName: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  emergencyContactPhone: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  emergencyContactRelation: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  agreeToMLHCodeOfConduct: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  agreeToMLHPrivacyPolicy: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  agreeToMLHCommunications: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const StringFilterSchema: z.ZodType<Prisma.StringFilter> = z.object({
  equals: z.string().optional(),
  in: z.string().array().optional(),
  notIn: z.string().array().optional(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  mode: z.lazy(() => QueryModeSchema).optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringFilterSchema) ]).optional(),
}).strict();

export const StringNullableFilterSchema: z.ZodType<Prisma.StringNullableFilter> = z.object({
  equals: z.string().optional().nullable(),
  in: z.string().array().optional().nullable(),
  notIn: z.string().array().optional().nullable(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  mode: z.lazy(() => QueryModeSchema).optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringNullableFilterSchema) ]).optional().nullable(),
}).strict();

export const IntNullableFilterSchema: z.ZodType<Prisma.IntNullableFilter> = z.object({
  equals: z.number().optional().nullable(),
  in: z.number().array().optional().nullable(),
  notIn: z.number().array().optional().nullable(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntNullableFilterSchema) ]).optional().nullable(),
}).strict();

export const UserRelationFilterSchema: z.ZodType<Prisma.UserRelationFilter> = z.object({
  is: z.lazy(() => UserWhereInputSchema).optional(),
  isNot: z.lazy(() => UserWhereInputSchema).optional()
}).strict();

export const SortOrderInputSchema: z.ZodType<Prisma.SortOrderInput> = z.object({
  sort: z.lazy(() => SortOrderSchema),
  nulls: z.lazy(() => NullsOrderSchema).optional()
}).strict();

export const AccountProviderProviderAccountIdCompoundUniqueInputSchema: z.ZodType<Prisma.AccountProviderProviderAccountIdCompoundUniqueInput> = z.object({
  provider: z.string(),
  providerAccountId: z.string()
}).strict();

export const AccountCountOrderByAggregateInputSchema: z.ZodType<Prisma.AccountCountOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  type: z.lazy(() => SortOrderSchema).optional(),
  provider: z.lazy(() => SortOrderSchema).optional(),
  providerAccountId: z.lazy(() => SortOrderSchema).optional(),
  refresh_token: z.lazy(() => SortOrderSchema).optional(),
  refresh_token_expires_in: z.lazy(() => SortOrderSchema).optional(),
  access_token: z.lazy(() => SortOrderSchema).optional(),
  expires_at: z.lazy(() => SortOrderSchema).optional(),
  ext_expires_in: z.lazy(() => SortOrderSchema).optional(),
  oauth_token_secret: z.lazy(() => SortOrderSchema).optional(),
  oauth_token: z.lazy(() => SortOrderSchema).optional(),
  token_type: z.lazy(() => SortOrderSchema).optional(),
  scope: z.lazy(() => SortOrderSchema).optional(),
  id_token: z.lazy(() => SortOrderSchema).optional(),
  session_state: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const AccountAvgOrderByAggregateInputSchema: z.ZodType<Prisma.AccountAvgOrderByAggregateInput> = z.object({
  refresh_token_expires_in: z.lazy(() => SortOrderSchema).optional(),
  expires_at: z.lazy(() => SortOrderSchema).optional(),
  ext_expires_in: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const AccountMaxOrderByAggregateInputSchema: z.ZodType<Prisma.AccountMaxOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  type: z.lazy(() => SortOrderSchema).optional(),
  provider: z.lazy(() => SortOrderSchema).optional(),
  providerAccountId: z.lazy(() => SortOrderSchema).optional(),
  refresh_token: z.lazy(() => SortOrderSchema).optional(),
  refresh_token_expires_in: z.lazy(() => SortOrderSchema).optional(),
  access_token: z.lazy(() => SortOrderSchema).optional(),
  expires_at: z.lazy(() => SortOrderSchema).optional(),
  ext_expires_in: z.lazy(() => SortOrderSchema).optional(),
  oauth_token_secret: z.lazy(() => SortOrderSchema).optional(),
  oauth_token: z.lazy(() => SortOrderSchema).optional(),
  token_type: z.lazy(() => SortOrderSchema).optional(),
  scope: z.lazy(() => SortOrderSchema).optional(),
  id_token: z.lazy(() => SortOrderSchema).optional(),
  session_state: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const AccountMinOrderByAggregateInputSchema: z.ZodType<Prisma.AccountMinOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  type: z.lazy(() => SortOrderSchema).optional(),
  provider: z.lazy(() => SortOrderSchema).optional(),
  providerAccountId: z.lazy(() => SortOrderSchema).optional(),
  refresh_token: z.lazy(() => SortOrderSchema).optional(),
  refresh_token_expires_in: z.lazy(() => SortOrderSchema).optional(),
  access_token: z.lazy(() => SortOrderSchema).optional(),
  expires_at: z.lazy(() => SortOrderSchema).optional(),
  ext_expires_in: z.lazy(() => SortOrderSchema).optional(),
  oauth_token_secret: z.lazy(() => SortOrderSchema).optional(),
  oauth_token: z.lazy(() => SortOrderSchema).optional(),
  token_type: z.lazy(() => SortOrderSchema).optional(),
  scope: z.lazy(() => SortOrderSchema).optional(),
  id_token: z.lazy(() => SortOrderSchema).optional(),
  session_state: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const AccountSumOrderByAggregateInputSchema: z.ZodType<Prisma.AccountSumOrderByAggregateInput> = z.object({
  refresh_token_expires_in: z.lazy(() => SortOrderSchema).optional(),
  expires_at: z.lazy(() => SortOrderSchema).optional(),
  ext_expires_in: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const StringWithAggregatesFilterSchema: z.ZodType<Prisma.StringWithAggregatesFilter> = z.object({
  equals: z.string().optional(),
  in: z.string().array().optional(),
  notIn: z.string().array().optional(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  mode: z.lazy(() => QueryModeSchema).optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedStringFilterSchema).optional(),
  _max: z.lazy(() => NestedStringFilterSchema).optional()
}).strict();

export const StringNullableWithAggregatesFilterSchema: z.ZodType<Prisma.StringNullableWithAggregatesFilter> = z.object({
  equals: z.string().optional().nullable(),
  in: z.string().array().optional().nullable(),
  notIn: z.string().array().optional().nullable(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  mode: z.lazy(() => QueryModeSchema).optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringNullableWithAggregatesFilterSchema) ]).optional().nullable(),
  _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _min: z.lazy(() => NestedStringNullableFilterSchema).optional(),
  _max: z.lazy(() => NestedStringNullableFilterSchema).optional()
}).strict();

export const IntNullableWithAggregatesFilterSchema: z.ZodType<Prisma.IntNullableWithAggregatesFilter> = z.object({
  equals: z.number().optional().nullable(),
  in: z.number().array().optional().nullable(),
  notIn: z.number().array().optional().nullable(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntNullableWithAggregatesFilterSchema) ]).optional().nullable(),
  _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _avg: z.lazy(() => NestedFloatNullableFilterSchema).optional(),
  _sum: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _min: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _max: z.lazy(() => NestedIntNullableFilterSchema).optional()
}).strict();

export const DateTimeFilterSchema: z.ZodType<Prisma.DateTimeFilter> = z.object({
  equals: z.coerce.date().optional(),
  in: z.coerce.date().array().optional(),
  notIn: z.coerce.date().array().optional(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([ z.coerce.date(),z.lazy(() => NestedDateTimeFilterSchema) ]).optional(),
}).strict();

export const SessionCountOrderByAggregateInputSchema: z.ZodType<Prisma.SessionCountOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  sessionToken: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  expires: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const SessionMaxOrderByAggregateInputSchema: z.ZodType<Prisma.SessionMaxOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  sessionToken: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  expires: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const SessionMinOrderByAggregateInputSchema: z.ZodType<Prisma.SessionMinOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  sessionToken: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  expires: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const DateTimeWithAggregatesFilterSchema: z.ZodType<Prisma.DateTimeWithAggregatesFilter> = z.object({
  equals: z.coerce.date().optional(),
  in: z.coerce.date().array().optional(),
  notIn: z.coerce.date().array().optional(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([ z.coerce.date(),z.lazy(() => NestedDateTimeWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedDateTimeFilterSchema).optional(),
  _max: z.lazy(() => NestedDateTimeFilterSchema).optional()
}).strict();

export const DateTimeNullableFilterSchema: z.ZodType<Prisma.DateTimeNullableFilter> = z.object({
  equals: z.coerce.date().optional().nullable(),
  in: z.coerce.date().array().optional().nullable(),
  notIn: z.coerce.date().array().optional().nullable(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([ z.coerce.date(),z.lazy(() => NestedDateTimeNullableFilterSchema) ]).optional().nullable(),
}).strict();

export const EnumRoleNullableListFilterSchema: z.ZodType<Prisma.EnumRoleNullableListFilter> = z.object({
  equals: z.lazy(() => RoleSchema).array().optional().nullable(),
  has: z.lazy(() => RoleSchema).optional().nullable(),
  hasEvery: z.lazy(() => RoleSchema).array().optional(),
  hasSome: z.lazy(() => RoleSchema).array().optional(),
  isEmpty: z.boolean().optional()
}).strict();

export const EnumStatusFilterSchema: z.ZodType<Prisma.EnumStatusFilter> = z.object({
  equals: z.lazy(() => StatusSchema).optional(),
  in: z.lazy(() => StatusSchema).array().optional(),
  notIn: z.lazy(() => StatusSchema).array().optional(),
  not: z.union([ z.lazy(() => StatusSchema),z.lazy(() => NestedEnumStatusFilterSchema) ]).optional(),
}).strict();

export const IntFilterSchema: z.ZodType<Prisma.IntFilter> = z.object({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntFilterSchema) ]).optional(),
}).strict();

export const AccountListRelationFilterSchema: z.ZodType<Prisma.AccountListRelationFilter> = z.object({
  every: z.lazy(() => AccountWhereInputSchema).optional(),
  some: z.lazy(() => AccountWhereInputSchema).optional(),
  none: z.lazy(() => AccountWhereInputSchema).optional()
}).strict();

export const SessionListRelationFilterSchema: z.ZodType<Prisma.SessionListRelationFilter> = z.object({
  every: z.lazy(() => SessionWhereInputSchema).optional(),
  some: z.lazy(() => SessionWhereInputSchema).optional(),
  none: z.lazy(() => SessionWhereInputSchema).optional()
}).strict();

export const ReviewListRelationFilterSchema: z.ZodType<Prisma.ReviewListRelationFilter> = z.object({
  every: z.lazy(() => ReviewWhereInputSchema).optional(),
  some: z.lazy(() => ReviewWhereInputSchema).optional(),
  none: z.lazy(() => ReviewWhereInputSchema).optional()
}).strict();

export const EventLogListRelationFilterSchema: z.ZodType<Prisma.EventLogListRelationFilter> = z.object({
  every: z.lazy(() => EventLogWhereInputSchema).optional(),
  some: z.lazy(() => EventLogWhereInputSchema).optional(),
  none: z.lazy(() => EventLogWhereInputSchema).optional()
}).strict();

export const DH10ApplicationNullableRelationFilterSchema: z.ZodType<Prisma.DH10ApplicationNullableRelationFilter> = z.object({
  is: z.lazy(() => DH10ApplicationWhereInputSchema).optional().nullable(),
  isNot: z.lazy(() => DH10ApplicationWhereInputSchema).optional().nullable()
}).strict();

export const AccountOrderByRelationAggregateInputSchema: z.ZodType<Prisma.AccountOrderByRelationAggregateInput> = z.object({
  _count: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const SessionOrderByRelationAggregateInputSchema: z.ZodType<Prisma.SessionOrderByRelationAggregateInput> = z.object({
  _count: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const ReviewOrderByRelationAggregateInputSchema: z.ZodType<Prisma.ReviewOrderByRelationAggregateInput> = z.object({
  _count: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const EventLogOrderByRelationAggregateInputSchema: z.ZodType<Prisma.EventLogOrderByRelationAggregateInput> = z.object({
  _count: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const UserCountOrderByAggregateInputSchema: z.ZodType<Prisma.UserCountOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  email: z.lazy(() => SortOrderSchema).optional(),
  emailVerified: z.lazy(() => SortOrderSchema).optional(),
  image: z.lazy(() => SortOrderSchema).optional(),
  typeform_response_id: z.lazy(() => SortOrderSchema).optional(),
  role: z.lazy(() => SortOrderSchema).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  qrcode: z.lazy(() => SortOrderSchema).optional(),
  mealsTaken: z.lazy(() => SortOrderSchema).optional(),
  lastMealTaken: z.lazy(() => SortOrderSchema).optional(),
  dH10ApplicationId: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const UserAvgOrderByAggregateInputSchema: z.ZodType<Prisma.UserAvgOrderByAggregateInput> = z.object({
  qrcode: z.lazy(() => SortOrderSchema).optional(),
  mealsTaken: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const UserMaxOrderByAggregateInputSchema: z.ZodType<Prisma.UserMaxOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  email: z.lazy(() => SortOrderSchema).optional(),
  emailVerified: z.lazy(() => SortOrderSchema).optional(),
  image: z.lazy(() => SortOrderSchema).optional(),
  typeform_response_id: z.lazy(() => SortOrderSchema).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  qrcode: z.lazy(() => SortOrderSchema).optional(),
  mealsTaken: z.lazy(() => SortOrderSchema).optional(),
  lastMealTaken: z.lazy(() => SortOrderSchema).optional(),
  dH10ApplicationId: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const UserMinOrderByAggregateInputSchema: z.ZodType<Prisma.UserMinOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  email: z.lazy(() => SortOrderSchema).optional(),
  emailVerified: z.lazy(() => SortOrderSchema).optional(),
  image: z.lazy(() => SortOrderSchema).optional(),
  typeform_response_id: z.lazy(() => SortOrderSchema).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  qrcode: z.lazy(() => SortOrderSchema).optional(),
  mealsTaken: z.lazy(() => SortOrderSchema).optional(),
  lastMealTaken: z.lazy(() => SortOrderSchema).optional(),
  dH10ApplicationId: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const UserSumOrderByAggregateInputSchema: z.ZodType<Prisma.UserSumOrderByAggregateInput> = z.object({
  qrcode: z.lazy(() => SortOrderSchema).optional(),
  mealsTaken: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const DateTimeNullableWithAggregatesFilterSchema: z.ZodType<Prisma.DateTimeNullableWithAggregatesFilter> = z.object({
  equals: z.coerce.date().optional().nullable(),
  in: z.coerce.date().array().optional().nullable(),
  notIn: z.coerce.date().array().optional().nullable(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([ z.coerce.date(),z.lazy(() => NestedDateTimeNullableWithAggregatesFilterSchema) ]).optional().nullable(),
  _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _min: z.lazy(() => NestedDateTimeNullableFilterSchema).optional(),
  _max: z.lazy(() => NestedDateTimeNullableFilterSchema).optional()
}).strict();

export const EnumStatusWithAggregatesFilterSchema: z.ZodType<Prisma.EnumStatusWithAggregatesFilter> = z.object({
  equals: z.lazy(() => StatusSchema).optional(),
  in: z.lazy(() => StatusSchema).array().optional(),
  notIn: z.lazy(() => StatusSchema).array().optional(),
  not: z.union([ z.lazy(() => StatusSchema),z.lazy(() => NestedEnumStatusWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumStatusFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumStatusFilterSchema).optional()
}).strict();

export const IntWithAggregatesFilterSchema: z.ZodType<Prisma.IntWithAggregatesFilter> = z.object({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _avg: z.lazy(() => NestedFloatFilterSchema).optional(),
  _sum: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedIntFilterSchema).optional(),
  _max: z.lazy(() => NestedIntFilterSchema).optional()
}).strict();

export const FloatFilterSchema: z.ZodType<Prisma.FloatFilter> = z.object({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedFloatFilterSchema) ]).optional(),
}).strict();

export const ReviewCountOrderByAggregateInputSchema: z.ZodType<Prisma.ReviewCountOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  hackerId: z.lazy(() => SortOrderSchema).optional(),
  reviewerId: z.lazy(() => SortOrderSchema).optional(),
  mark: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const ReviewAvgOrderByAggregateInputSchema: z.ZodType<Prisma.ReviewAvgOrderByAggregateInput> = z.object({
  mark: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const ReviewMaxOrderByAggregateInputSchema: z.ZodType<Prisma.ReviewMaxOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  hackerId: z.lazy(() => SortOrderSchema).optional(),
  reviewerId: z.lazy(() => SortOrderSchema).optional(),
  mark: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const ReviewMinOrderByAggregateInputSchema: z.ZodType<Prisma.ReviewMinOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  hackerId: z.lazy(() => SortOrderSchema).optional(),
  reviewerId: z.lazy(() => SortOrderSchema).optional(),
  mark: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const ReviewSumOrderByAggregateInputSchema: z.ZodType<Prisma.ReviewSumOrderByAggregateInput> = z.object({
  mark: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const FloatWithAggregatesFilterSchema: z.ZodType<Prisma.FloatWithAggregatesFilter> = z.object({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedFloatWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _avg: z.lazy(() => NestedFloatFilterSchema).optional(),
  _sum: z.lazy(() => NestedFloatFilterSchema).optional(),
  _min: z.lazy(() => NestedFloatFilterSchema).optional(),
  _max: z.lazy(() => NestedFloatFilterSchema).optional()
}).strict();

export const EventLogCountOrderByAggregateInputSchema: z.ZodType<Prisma.EventLogCountOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  timestamp: z.lazy(() => SortOrderSchema).optional(),
  event: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const EventLogMaxOrderByAggregateInputSchema: z.ZodType<Prisma.EventLogMaxOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  timestamp: z.lazy(() => SortOrderSchema).optional(),
  event: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const EventLogMinOrderByAggregateInputSchema: z.ZodType<Prisma.EventLogMinOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  timestamp: z.lazy(() => SortOrderSchema).optional(),
  event: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const VerificationTokenIdentifierTokenCompoundUniqueInputSchema: z.ZodType<Prisma.VerificationTokenIdentifierTokenCompoundUniqueInput> = z.object({
  identifier: z.string(),
  token: z.string()
}).strict();

export const VerificationTokenCountOrderByAggregateInputSchema: z.ZodType<Prisma.VerificationTokenCountOrderByAggregateInput> = z.object({
  identifier: z.lazy(() => SortOrderSchema).optional(),
  token: z.lazy(() => SortOrderSchema).optional(),
  expires: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const VerificationTokenMaxOrderByAggregateInputSchema: z.ZodType<Prisma.VerificationTokenMaxOrderByAggregateInput> = z.object({
  identifier: z.lazy(() => SortOrderSchema).optional(),
  token: z.lazy(() => SortOrderSchema).optional(),
  expires: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const VerificationTokenMinOrderByAggregateInputSchema: z.ZodType<Prisma.VerificationTokenMinOrderByAggregateInput> = z.object({
  identifier: z.lazy(() => SortOrderSchema).optional(),
  token: z.lazy(() => SortOrderSchema).optional(),
  expires: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const BoolFilterSchema: z.ZodType<Prisma.BoolFilter> = z.object({
  equals: z.boolean().optional(),
  not: z.union([ z.boolean(),z.lazy(() => NestedBoolFilterSchema) ]).optional(),
}).strict();

export const StringNullableListFilterSchema: z.ZodType<Prisma.StringNullableListFilter> = z.object({
  equals: z.string().array().optional().nullable(),
  has: z.string().optional().nullable(),
  hasEvery: z.string().array().optional(),
  hasSome: z.string().array().optional(),
  isEmpty: z.boolean().optional()
}).strict();

export const UserNullableRelationFilterSchema: z.ZodType<Prisma.UserNullableRelationFilter> = z.object({
  is: z.lazy(() => UserWhereInputSchema).optional().nullable(),
  isNot: z.lazy(() => UserWhereInputSchema).optional().nullable()
}).strict();

export const DH10ApplicationCountOrderByAggregateInputSchema: z.ZodType<Prisma.DH10ApplicationCountOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  firstName: z.lazy(() => SortOrderSchema).optional(),
  lastName: z.lazy(() => SortOrderSchema).optional(),
  birthday: z.lazy(() => SortOrderSchema).optional(),
  studyEnrolledPostSecondary: z.lazy(() => SortOrderSchema).optional(),
  studyLocation: z.lazy(() => SortOrderSchema).optional(),
  studyDegree: z.lazy(() => SortOrderSchema).optional(),
  studyMajor: z.lazy(() => SortOrderSchema).optional(),
  studyYearOfStudy: z.lazy(() => SortOrderSchema).optional(),
  studyExpectedGraduation: z.lazy(() => SortOrderSchema).optional(),
  previousHackathonsCount: z.lazy(() => SortOrderSchema).optional(),
  longAnswerChange: z.lazy(() => SortOrderSchema).optional(),
  longAnswerExperience: z.lazy(() => SortOrderSchema).optional(),
  longAnswerTech: z.lazy(() => SortOrderSchema).optional(),
  longAnswerMeaning: z.lazy(() => SortOrderSchema).optional(),
  longAnswerFuture: z.lazy(() => SortOrderSchema).optional(),
  longAnswerMagic: z.lazy(() => SortOrderSchema).optional(),
  socialText: z.lazy(() => SortOrderSchema).optional(),
  interests: z.lazy(() => SortOrderSchema).optional(),
  tshirtSize: z.lazy(() => SortOrderSchema).optional(),
  hackerKind: z.lazy(() => SortOrderSchema).optional(),
  alreadyHaveTeam: z.lazy(() => SortOrderSchema).optional(),
  workshopChoices: z.lazy(() => SortOrderSchema).optional(),
  considerCoffee: z.lazy(() => SortOrderSchema).optional(),
  discoverdFrom: z.lazy(() => SortOrderSchema).optional(),
  gender: z.lazy(() => SortOrderSchema).optional(),
  race: z.lazy(() => SortOrderSchema).optional(),
  emergencyContactName: z.lazy(() => SortOrderSchema).optional(),
  emergencyContactPhone: z.lazy(() => SortOrderSchema).optional(),
  emergencyContactRelation: z.lazy(() => SortOrderSchema).optional(),
  agreeToMLHCodeOfConduct: z.lazy(() => SortOrderSchema).optional(),
  agreeToMLHPrivacyPolicy: z.lazy(() => SortOrderSchema).optional(),
  agreeToMLHCommunications: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const DH10ApplicationAvgOrderByAggregateInputSchema: z.ZodType<Prisma.DH10ApplicationAvgOrderByAggregateInput> = z.object({
  studyYearOfStudy: z.lazy(() => SortOrderSchema).optional(),
  previousHackathonsCount: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const DH10ApplicationMaxOrderByAggregateInputSchema: z.ZodType<Prisma.DH10ApplicationMaxOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  firstName: z.lazy(() => SortOrderSchema).optional(),
  lastName: z.lazy(() => SortOrderSchema).optional(),
  birthday: z.lazy(() => SortOrderSchema).optional(),
  studyEnrolledPostSecondary: z.lazy(() => SortOrderSchema).optional(),
  studyLocation: z.lazy(() => SortOrderSchema).optional(),
  studyDegree: z.lazy(() => SortOrderSchema).optional(),
  studyMajor: z.lazy(() => SortOrderSchema).optional(),
  studyYearOfStudy: z.lazy(() => SortOrderSchema).optional(),
  studyExpectedGraduation: z.lazy(() => SortOrderSchema).optional(),
  previousHackathonsCount: z.lazy(() => SortOrderSchema).optional(),
  longAnswerChange: z.lazy(() => SortOrderSchema).optional(),
  longAnswerExperience: z.lazy(() => SortOrderSchema).optional(),
  longAnswerTech: z.lazy(() => SortOrderSchema).optional(),
  longAnswerMeaning: z.lazy(() => SortOrderSchema).optional(),
  longAnswerFuture: z.lazy(() => SortOrderSchema).optional(),
  longAnswerMagic: z.lazy(() => SortOrderSchema).optional(),
  socialText: z.lazy(() => SortOrderSchema).optional(),
  interests: z.lazy(() => SortOrderSchema).optional(),
  tshirtSize: z.lazy(() => SortOrderSchema).optional(),
  hackerKind: z.lazy(() => SortOrderSchema).optional(),
  alreadyHaveTeam: z.lazy(() => SortOrderSchema).optional(),
  considerCoffee: z.lazy(() => SortOrderSchema).optional(),
  discoverdFrom: z.lazy(() => SortOrderSchema).optional(),
  gender: z.lazy(() => SortOrderSchema).optional(),
  race: z.lazy(() => SortOrderSchema).optional(),
  emergencyContactName: z.lazy(() => SortOrderSchema).optional(),
  emergencyContactPhone: z.lazy(() => SortOrderSchema).optional(),
  emergencyContactRelation: z.lazy(() => SortOrderSchema).optional(),
  agreeToMLHCodeOfConduct: z.lazy(() => SortOrderSchema).optional(),
  agreeToMLHPrivacyPolicy: z.lazy(() => SortOrderSchema).optional(),
  agreeToMLHCommunications: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const DH10ApplicationMinOrderByAggregateInputSchema: z.ZodType<Prisma.DH10ApplicationMinOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  firstName: z.lazy(() => SortOrderSchema).optional(),
  lastName: z.lazy(() => SortOrderSchema).optional(),
  birthday: z.lazy(() => SortOrderSchema).optional(),
  studyEnrolledPostSecondary: z.lazy(() => SortOrderSchema).optional(),
  studyLocation: z.lazy(() => SortOrderSchema).optional(),
  studyDegree: z.lazy(() => SortOrderSchema).optional(),
  studyMajor: z.lazy(() => SortOrderSchema).optional(),
  studyYearOfStudy: z.lazy(() => SortOrderSchema).optional(),
  studyExpectedGraduation: z.lazy(() => SortOrderSchema).optional(),
  previousHackathonsCount: z.lazy(() => SortOrderSchema).optional(),
  longAnswerChange: z.lazy(() => SortOrderSchema).optional(),
  longAnswerExperience: z.lazy(() => SortOrderSchema).optional(),
  longAnswerTech: z.lazy(() => SortOrderSchema).optional(),
  longAnswerMeaning: z.lazy(() => SortOrderSchema).optional(),
  longAnswerFuture: z.lazy(() => SortOrderSchema).optional(),
  longAnswerMagic: z.lazy(() => SortOrderSchema).optional(),
  socialText: z.lazy(() => SortOrderSchema).optional(),
  interests: z.lazy(() => SortOrderSchema).optional(),
  tshirtSize: z.lazy(() => SortOrderSchema).optional(),
  hackerKind: z.lazy(() => SortOrderSchema).optional(),
  alreadyHaveTeam: z.lazy(() => SortOrderSchema).optional(),
  considerCoffee: z.lazy(() => SortOrderSchema).optional(),
  discoverdFrom: z.lazy(() => SortOrderSchema).optional(),
  gender: z.lazy(() => SortOrderSchema).optional(),
  race: z.lazy(() => SortOrderSchema).optional(),
  emergencyContactName: z.lazy(() => SortOrderSchema).optional(),
  emergencyContactPhone: z.lazy(() => SortOrderSchema).optional(),
  emergencyContactRelation: z.lazy(() => SortOrderSchema).optional(),
  agreeToMLHCodeOfConduct: z.lazy(() => SortOrderSchema).optional(),
  agreeToMLHPrivacyPolicy: z.lazy(() => SortOrderSchema).optional(),
  agreeToMLHCommunications: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const DH10ApplicationSumOrderByAggregateInputSchema: z.ZodType<Prisma.DH10ApplicationSumOrderByAggregateInput> = z.object({
  studyYearOfStudy: z.lazy(() => SortOrderSchema).optional(),
  previousHackathonsCount: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const BoolWithAggregatesFilterSchema: z.ZodType<Prisma.BoolWithAggregatesFilter> = z.object({
  equals: z.boolean().optional(),
  not: z.union([ z.boolean(),z.lazy(() => NestedBoolWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedBoolFilterSchema).optional(),
  _max: z.lazy(() => NestedBoolFilterSchema).optional()
}).strict();

export const UserCreateNestedOneWithoutAccountsInputSchema: z.ZodType<Prisma.UserCreateNestedOneWithoutAccountsInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutAccountsInputSchema),z.lazy(() => UserUncheckedCreateWithoutAccountsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutAccountsInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional()
}).strict();

export const StringFieldUpdateOperationsInputSchema: z.ZodType<Prisma.StringFieldUpdateOperationsInput> = z.object({
  set: z.string().optional()
}).strict();

export const NullableStringFieldUpdateOperationsInputSchema: z.ZodType<Prisma.NullableStringFieldUpdateOperationsInput> = z.object({
  set: z.string().optional().nullable()
}).strict();

export const NullableIntFieldUpdateOperationsInputSchema: z.ZodType<Prisma.NullableIntFieldUpdateOperationsInput> = z.object({
  set: z.number().optional().nullable(),
  increment: z.number().optional(),
  decrement: z.number().optional(),
  multiply: z.number().optional(),
  divide: z.number().optional()
}).strict();

export const UserUpdateOneRequiredWithoutAccountsNestedInputSchema: z.ZodType<Prisma.UserUpdateOneRequiredWithoutAccountsNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutAccountsInputSchema),z.lazy(() => UserUncheckedCreateWithoutAccountsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutAccountsInputSchema).optional(),
  upsert: z.lazy(() => UserUpsertWithoutAccountsInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => UserUpdateToOneWithWhereWithoutAccountsInputSchema),z.lazy(() => UserUpdateWithoutAccountsInputSchema),z.lazy(() => UserUncheckedUpdateWithoutAccountsInputSchema) ]).optional(),
}).strict();

export const UserCreateNestedOneWithoutSessionsInputSchema: z.ZodType<Prisma.UserCreateNestedOneWithoutSessionsInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutSessionsInputSchema),z.lazy(() => UserUncheckedCreateWithoutSessionsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutSessionsInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional()
}).strict();

export const DateTimeFieldUpdateOperationsInputSchema: z.ZodType<Prisma.DateTimeFieldUpdateOperationsInput> = z.object({
  set: z.coerce.date().optional()
}).strict();

export const UserUpdateOneRequiredWithoutSessionsNestedInputSchema: z.ZodType<Prisma.UserUpdateOneRequiredWithoutSessionsNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutSessionsInputSchema),z.lazy(() => UserUncheckedCreateWithoutSessionsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutSessionsInputSchema).optional(),
  upsert: z.lazy(() => UserUpsertWithoutSessionsInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => UserUpdateToOneWithWhereWithoutSessionsInputSchema),z.lazy(() => UserUpdateWithoutSessionsInputSchema),z.lazy(() => UserUncheckedUpdateWithoutSessionsInputSchema) ]).optional(),
}).strict();

export const UserCreateroleInputSchema: z.ZodType<Prisma.UserCreateroleInput> = z.object({
  set: z.lazy(() => RoleSchema).array()
}).strict();

export const AccountCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.AccountCreateNestedManyWithoutUserInput> = z.object({
  create: z.union([ z.lazy(() => AccountCreateWithoutUserInputSchema),z.lazy(() => AccountCreateWithoutUserInputSchema).array(),z.lazy(() => AccountUncheckedCreateWithoutUserInputSchema),z.lazy(() => AccountUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => AccountCreateOrConnectWithoutUserInputSchema),z.lazy(() => AccountCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => AccountCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => AccountWhereUniqueInputSchema),z.lazy(() => AccountWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const SessionCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.SessionCreateNestedManyWithoutUserInput> = z.object({
  create: z.union([ z.lazy(() => SessionCreateWithoutUserInputSchema),z.lazy(() => SessionCreateWithoutUserInputSchema).array(),z.lazy(() => SessionUncheckedCreateWithoutUserInputSchema),z.lazy(() => SessionUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => SessionCreateOrConnectWithoutUserInputSchema),z.lazy(() => SessionCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => SessionCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => SessionWhereUniqueInputSchema),z.lazy(() => SessionWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const ReviewCreateNestedManyWithoutHackerInputSchema: z.ZodType<Prisma.ReviewCreateNestedManyWithoutHackerInput> = z.object({
  create: z.union([ z.lazy(() => ReviewCreateWithoutHackerInputSchema),z.lazy(() => ReviewCreateWithoutHackerInputSchema).array(),z.lazy(() => ReviewUncheckedCreateWithoutHackerInputSchema),z.lazy(() => ReviewUncheckedCreateWithoutHackerInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ReviewCreateOrConnectWithoutHackerInputSchema),z.lazy(() => ReviewCreateOrConnectWithoutHackerInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ReviewCreateManyHackerInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => ReviewWhereUniqueInputSchema),z.lazy(() => ReviewWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const ReviewCreateNestedManyWithoutReviewerInputSchema: z.ZodType<Prisma.ReviewCreateNestedManyWithoutReviewerInput> = z.object({
  create: z.union([ z.lazy(() => ReviewCreateWithoutReviewerInputSchema),z.lazy(() => ReviewCreateWithoutReviewerInputSchema).array(),z.lazy(() => ReviewUncheckedCreateWithoutReviewerInputSchema),z.lazy(() => ReviewUncheckedCreateWithoutReviewerInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ReviewCreateOrConnectWithoutReviewerInputSchema),z.lazy(() => ReviewCreateOrConnectWithoutReviewerInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ReviewCreateManyReviewerInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => ReviewWhereUniqueInputSchema),z.lazy(() => ReviewWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const EventLogCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.EventLogCreateNestedManyWithoutUserInput> = z.object({
  create: z.union([ z.lazy(() => EventLogCreateWithoutUserInputSchema),z.lazy(() => EventLogCreateWithoutUserInputSchema).array(),z.lazy(() => EventLogUncheckedCreateWithoutUserInputSchema),z.lazy(() => EventLogUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => EventLogCreateOrConnectWithoutUserInputSchema),z.lazy(() => EventLogCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => EventLogCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => EventLogWhereUniqueInputSchema),z.lazy(() => EventLogWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const DH10ApplicationCreateNestedOneWithoutUserInputSchema: z.ZodType<Prisma.DH10ApplicationCreateNestedOneWithoutUserInput> = z.object({
  create: z.union([ z.lazy(() => DH10ApplicationCreateWithoutUserInputSchema),z.lazy(() => DH10ApplicationUncheckedCreateWithoutUserInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => DH10ApplicationCreateOrConnectWithoutUserInputSchema).optional(),
  connect: z.lazy(() => DH10ApplicationWhereUniqueInputSchema).optional()
}).strict();

export const AccountUncheckedCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.AccountUncheckedCreateNestedManyWithoutUserInput> = z.object({
  create: z.union([ z.lazy(() => AccountCreateWithoutUserInputSchema),z.lazy(() => AccountCreateWithoutUserInputSchema).array(),z.lazy(() => AccountUncheckedCreateWithoutUserInputSchema),z.lazy(() => AccountUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => AccountCreateOrConnectWithoutUserInputSchema),z.lazy(() => AccountCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => AccountCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => AccountWhereUniqueInputSchema),z.lazy(() => AccountWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const SessionUncheckedCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.SessionUncheckedCreateNestedManyWithoutUserInput> = z.object({
  create: z.union([ z.lazy(() => SessionCreateWithoutUserInputSchema),z.lazy(() => SessionCreateWithoutUserInputSchema).array(),z.lazy(() => SessionUncheckedCreateWithoutUserInputSchema),z.lazy(() => SessionUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => SessionCreateOrConnectWithoutUserInputSchema),z.lazy(() => SessionCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => SessionCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => SessionWhereUniqueInputSchema),z.lazy(() => SessionWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const ReviewUncheckedCreateNestedManyWithoutHackerInputSchema: z.ZodType<Prisma.ReviewUncheckedCreateNestedManyWithoutHackerInput> = z.object({
  create: z.union([ z.lazy(() => ReviewCreateWithoutHackerInputSchema),z.lazy(() => ReviewCreateWithoutHackerInputSchema).array(),z.lazy(() => ReviewUncheckedCreateWithoutHackerInputSchema),z.lazy(() => ReviewUncheckedCreateWithoutHackerInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ReviewCreateOrConnectWithoutHackerInputSchema),z.lazy(() => ReviewCreateOrConnectWithoutHackerInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ReviewCreateManyHackerInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => ReviewWhereUniqueInputSchema),z.lazy(() => ReviewWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const ReviewUncheckedCreateNestedManyWithoutReviewerInputSchema: z.ZodType<Prisma.ReviewUncheckedCreateNestedManyWithoutReviewerInput> = z.object({
  create: z.union([ z.lazy(() => ReviewCreateWithoutReviewerInputSchema),z.lazy(() => ReviewCreateWithoutReviewerInputSchema).array(),z.lazy(() => ReviewUncheckedCreateWithoutReviewerInputSchema),z.lazy(() => ReviewUncheckedCreateWithoutReviewerInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ReviewCreateOrConnectWithoutReviewerInputSchema),z.lazy(() => ReviewCreateOrConnectWithoutReviewerInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ReviewCreateManyReviewerInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => ReviewWhereUniqueInputSchema),z.lazy(() => ReviewWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const EventLogUncheckedCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.EventLogUncheckedCreateNestedManyWithoutUserInput> = z.object({
  create: z.union([ z.lazy(() => EventLogCreateWithoutUserInputSchema),z.lazy(() => EventLogCreateWithoutUserInputSchema).array(),z.lazy(() => EventLogUncheckedCreateWithoutUserInputSchema),z.lazy(() => EventLogUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => EventLogCreateOrConnectWithoutUserInputSchema),z.lazy(() => EventLogCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => EventLogCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => EventLogWhereUniqueInputSchema),z.lazy(() => EventLogWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const NullableDateTimeFieldUpdateOperationsInputSchema: z.ZodType<Prisma.NullableDateTimeFieldUpdateOperationsInput> = z.object({
  set: z.coerce.date().optional().nullable()
}).strict();

export const UserUpdateroleInputSchema: z.ZodType<Prisma.UserUpdateroleInput> = z.object({
  set: z.lazy(() => RoleSchema).array().optional()
}).strict();

export const EnumStatusFieldUpdateOperationsInputSchema: z.ZodType<Prisma.EnumStatusFieldUpdateOperationsInput> = z.object({
  set: z.lazy(() => StatusSchema).optional()
}).strict();

export const IntFieldUpdateOperationsInputSchema: z.ZodType<Prisma.IntFieldUpdateOperationsInput> = z.object({
  set: z.number().optional(),
  increment: z.number().optional(),
  decrement: z.number().optional(),
  multiply: z.number().optional(),
  divide: z.number().optional()
}).strict();

export const AccountUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.AccountUpdateManyWithoutUserNestedInput> = z.object({
  create: z.union([ z.lazy(() => AccountCreateWithoutUserInputSchema),z.lazy(() => AccountCreateWithoutUserInputSchema).array(),z.lazy(() => AccountUncheckedCreateWithoutUserInputSchema),z.lazy(() => AccountUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => AccountCreateOrConnectWithoutUserInputSchema),z.lazy(() => AccountCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => AccountUpsertWithWhereUniqueWithoutUserInputSchema),z.lazy(() => AccountUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => AccountCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => AccountWhereUniqueInputSchema),z.lazy(() => AccountWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => AccountWhereUniqueInputSchema),z.lazy(() => AccountWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => AccountWhereUniqueInputSchema),z.lazy(() => AccountWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => AccountWhereUniqueInputSchema),z.lazy(() => AccountWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => AccountUpdateWithWhereUniqueWithoutUserInputSchema),z.lazy(() => AccountUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => AccountUpdateManyWithWhereWithoutUserInputSchema),z.lazy(() => AccountUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => AccountScalarWhereInputSchema),z.lazy(() => AccountScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const SessionUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.SessionUpdateManyWithoutUserNestedInput> = z.object({
  create: z.union([ z.lazy(() => SessionCreateWithoutUserInputSchema),z.lazy(() => SessionCreateWithoutUserInputSchema).array(),z.lazy(() => SessionUncheckedCreateWithoutUserInputSchema),z.lazy(() => SessionUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => SessionCreateOrConnectWithoutUserInputSchema),z.lazy(() => SessionCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => SessionUpsertWithWhereUniqueWithoutUserInputSchema),z.lazy(() => SessionUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => SessionCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => SessionWhereUniqueInputSchema),z.lazy(() => SessionWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => SessionWhereUniqueInputSchema),z.lazy(() => SessionWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => SessionWhereUniqueInputSchema),z.lazy(() => SessionWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => SessionWhereUniqueInputSchema),z.lazy(() => SessionWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => SessionUpdateWithWhereUniqueWithoutUserInputSchema),z.lazy(() => SessionUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => SessionUpdateManyWithWhereWithoutUserInputSchema),z.lazy(() => SessionUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => SessionScalarWhereInputSchema),z.lazy(() => SessionScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const ReviewUpdateManyWithoutHackerNestedInputSchema: z.ZodType<Prisma.ReviewUpdateManyWithoutHackerNestedInput> = z.object({
  create: z.union([ z.lazy(() => ReviewCreateWithoutHackerInputSchema),z.lazy(() => ReviewCreateWithoutHackerInputSchema).array(),z.lazy(() => ReviewUncheckedCreateWithoutHackerInputSchema),z.lazy(() => ReviewUncheckedCreateWithoutHackerInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ReviewCreateOrConnectWithoutHackerInputSchema),z.lazy(() => ReviewCreateOrConnectWithoutHackerInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => ReviewUpsertWithWhereUniqueWithoutHackerInputSchema),z.lazy(() => ReviewUpsertWithWhereUniqueWithoutHackerInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ReviewCreateManyHackerInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => ReviewWhereUniqueInputSchema),z.lazy(() => ReviewWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => ReviewWhereUniqueInputSchema),z.lazy(() => ReviewWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => ReviewWhereUniqueInputSchema),z.lazy(() => ReviewWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => ReviewWhereUniqueInputSchema),z.lazy(() => ReviewWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => ReviewUpdateWithWhereUniqueWithoutHackerInputSchema),z.lazy(() => ReviewUpdateWithWhereUniqueWithoutHackerInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => ReviewUpdateManyWithWhereWithoutHackerInputSchema),z.lazy(() => ReviewUpdateManyWithWhereWithoutHackerInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => ReviewScalarWhereInputSchema),z.lazy(() => ReviewScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const ReviewUpdateManyWithoutReviewerNestedInputSchema: z.ZodType<Prisma.ReviewUpdateManyWithoutReviewerNestedInput> = z.object({
  create: z.union([ z.lazy(() => ReviewCreateWithoutReviewerInputSchema),z.lazy(() => ReviewCreateWithoutReviewerInputSchema).array(),z.lazy(() => ReviewUncheckedCreateWithoutReviewerInputSchema),z.lazy(() => ReviewUncheckedCreateWithoutReviewerInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ReviewCreateOrConnectWithoutReviewerInputSchema),z.lazy(() => ReviewCreateOrConnectWithoutReviewerInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => ReviewUpsertWithWhereUniqueWithoutReviewerInputSchema),z.lazy(() => ReviewUpsertWithWhereUniqueWithoutReviewerInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ReviewCreateManyReviewerInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => ReviewWhereUniqueInputSchema),z.lazy(() => ReviewWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => ReviewWhereUniqueInputSchema),z.lazy(() => ReviewWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => ReviewWhereUniqueInputSchema),z.lazy(() => ReviewWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => ReviewWhereUniqueInputSchema),z.lazy(() => ReviewWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => ReviewUpdateWithWhereUniqueWithoutReviewerInputSchema),z.lazy(() => ReviewUpdateWithWhereUniqueWithoutReviewerInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => ReviewUpdateManyWithWhereWithoutReviewerInputSchema),z.lazy(() => ReviewUpdateManyWithWhereWithoutReviewerInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => ReviewScalarWhereInputSchema),z.lazy(() => ReviewScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const EventLogUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.EventLogUpdateManyWithoutUserNestedInput> = z.object({
  create: z.union([ z.lazy(() => EventLogCreateWithoutUserInputSchema),z.lazy(() => EventLogCreateWithoutUserInputSchema).array(),z.lazy(() => EventLogUncheckedCreateWithoutUserInputSchema),z.lazy(() => EventLogUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => EventLogCreateOrConnectWithoutUserInputSchema),z.lazy(() => EventLogCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => EventLogUpsertWithWhereUniqueWithoutUserInputSchema),z.lazy(() => EventLogUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => EventLogCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => EventLogWhereUniqueInputSchema),z.lazy(() => EventLogWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => EventLogWhereUniqueInputSchema),z.lazy(() => EventLogWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => EventLogWhereUniqueInputSchema),z.lazy(() => EventLogWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => EventLogWhereUniqueInputSchema),z.lazy(() => EventLogWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => EventLogUpdateWithWhereUniqueWithoutUserInputSchema),z.lazy(() => EventLogUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => EventLogUpdateManyWithWhereWithoutUserInputSchema),z.lazy(() => EventLogUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => EventLogScalarWhereInputSchema),z.lazy(() => EventLogScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const DH10ApplicationUpdateOneWithoutUserNestedInputSchema: z.ZodType<Prisma.DH10ApplicationUpdateOneWithoutUserNestedInput> = z.object({
  create: z.union([ z.lazy(() => DH10ApplicationCreateWithoutUserInputSchema),z.lazy(() => DH10ApplicationUncheckedCreateWithoutUserInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => DH10ApplicationCreateOrConnectWithoutUserInputSchema).optional(),
  upsert: z.lazy(() => DH10ApplicationUpsertWithoutUserInputSchema).optional(),
  disconnect: z.union([ z.boolean(),z.lazy(() => DH10ApplicationWhereInputSchema) ]).optional(),
  delete: z.union([ z.boolean(),z.lazy(() => DH10ApplicationWhereInputSchema) ]).optional(),
  connect: z.lazy(() => DH10ApplicationWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => DH10ApplicationUpdateToOneWithWhereWithoutUserInputSchema),z.lazy(() => DH10ApplicationUpdateWithoutUserInputSchema),z.lazy(() => DH10ApplicationUncheckedUpdateWithoutUserInputSchema) ]).optional(),
}).strict();

export const AccountUncheckedUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.AccountUncheckedUpdateManyWithoutUserNestedInput> = z.object({
  create: z.union([ z.lazy(() => AccountCreateWithoutUserInputSchema),z.lazy(() => AccountCreateWithoutUserInputSchema).array(),z.lazy(() => AccountUncheckedCreateWithoutUserInputSchema),z.lazy(() => AccountUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => AccountCreateOrConnectWithoutUserInputSchema),z.lazy(() => AccountCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => AccountUpsertWithWhereUniqueWithoutUserInputSchema),z.lazy(() => AccountUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => AccountCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => AccountWhereUniqueInputSchema),z.lazy(() => AccountWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => AccountWhereUniqueInputSchema),z.lazy(() => AccountWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => AccountWhereUniqueInputSchema),z.lazy(() => AccountWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => AccountWhereUniqueInputSchema),z.lazy(() => AccountWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => AccountUpdateWithWhereUniqueWithoutUserInputSchema),z.lazy(() => AccountUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => AccountUpdateManyWithWhereWithoutUserInputSchema),z.lazy(() => AccountUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => AccountScalarWhereInputSchema),z.lazy(() => AccountScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const SessionUncheckedUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.SessionUncheckedUpdateManyWithoutUserNestedInput> = z.object({
  create: z.union([ z.lazy(() => SessionCreateWithoutUserInputSchema),z.lazy(() => SessionCreateWithoutUserInputSchema).array(),z.lazy(() => SessionUncheckedCreateWithoutUserInputSchema),z.lazy(() => SessionUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => SessionCreateOrConnectWithoutUserInputSchema),z.lazy(() => SessionCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => SessionUpsertWithWhereUniqueWithoutUserInputSchema),z.lazy(() => SessionUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => SessionCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => SessionWhereUniqueInputSchema),z.lazy(() => SessionWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => SessionWhereUniqueInputSchema),z.lazy(() => SessionWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => SessionWhereUniqueInputSchema),z.lazy(() => SessionWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => SessionWhereUniqueInputSchema),z.lazy(() => SessionWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => SessionUpdateWithWhereUniqueWithoutUserInputSchema),z.lazy(() => SessionUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => SessionUpdateManyWithWhereWithoutUserInputSchema),z.lazy(() => SessionUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => SessionScalarWhereInputSchema),z.lazy(() => SessionScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const ReviewUncheckedUpdateManyWithoutHackerNestedInputSchema: z.ZodType<Prisma.ReviewUncheckedUpdateManyWithoutHackerNestedInput> = z.object({
  create: z.union([ z.lazy(() => ReviewCreateWithoutHackerInputSchema),z.lazy(() => ReviewCreateWithoutHackerInputSchema).array(),z.lazy(() => ReviewUncheckedCreateWithoutHackerInputSchema),z.lazy(() => ReviewUncheckedCreateWithoutHackerInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ReviewCreateOrConnectWithoutHackerInputSchema),z.lazy(() => ReviewCreateOrConnectWithoutHackerInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => ReviewUpsertWithWhereUniqueWithoutHackerInputSchema),z.lazy(() => ReviewUpsertWithWhereUniqueWithoutHackerInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ReviewCreateManyHackerInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => ReviewWhereUniqueInputSchema),z.lazy(() => ReviewWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => ReviewWhereUniqueInputSchema),z.lazy(() => ReviewWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => ReviewWhereUniqueInputSchema),z.lazy(() => ReviewWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => ReviewWhereUniqueInputSchema),z.lazy(() => ReviewWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => ReviewUpdateWithWhereUniqueWithoutHackerInputSchema),z.lazy(() => ReviewUpdateWithWhereUniqueWithoutHackerInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => ReviewUpdateManyWithWhereWithoutHackerInputSchema),z.lazy(() => ReviewUpdateManyWithWhereWithoutHackerInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => ReviewScalarWhereInputSchema),z.lazy(() => ReviewScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const ReviewUncheckedUpdateManyWithoutReviewerNestedInputSchema: z.ZodType<Prisma.ReviewUncheckedUpdateManyWithoutReviewerNestedInput> = z.object({
  create: z.union([ z.lazy(() => ReviewCreateWithoutReviewerInputSchema),z.lazy(() => ReviewCreateWithoutReviewerInputSchema).array(),z.lazy(() => ReviewUncheckedCreateWithoutReviewerInputSchema),z.lazy(() => ReviewUncheckedCreateWithoutReviewerInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ReviewCreateOrConnectWithoutReviewerInputSchema),z.lazy(() => ReviewCreateOrConnectWithoutReviewerInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => ReviewUpsertWithWhereUniqueWithoutReviewerInputSchema),z.lazy(() => ReviewUpsertWithWhereUniqueWithoutReviewerInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ReviewCreateManyReviewerInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => ReviewWhereUniqueInputSchema),z.lazy(() => ReviewWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => ReviewWhereUniqueInputSchema),z.lazy(() => ReviewWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => ReviewWhereUniqueInputSchema),z.lazy(() => ReviewWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => ReviewWhereUniqueInputSchema),z.lazy(() => ReviewWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => ReviewUpdateWithWhereUniqueWithoutReviewerInputSchema),z.lazy(() => ReviewUpdateWithWhereUniqueWithoutReviewerInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => ReviewUpdateManyWithWhereWithoutReviewerInputSchema),z.lazy(() => ReviewUpdateManyWithWhereWithoutReviewerInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => ReviewScalarWhereInputSchema),z.lazy(() => ReviewScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const EventLogUncheckedUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.EventLogUncheckedUpdateManyWithoutUserNestedInput> = z.object({
  create: z.union([ z.lazy(() => EventLogCreateWithoutUserInputSchema),z.lazy(() => EventLogCreateWithoutUserInputSchema).array(),z.lazy(() => EventLogUncheckedCreateWithoutUserInputSchema),z.lazy(() => EventLogUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => EventLogCreateOrConnectWithoutUserInputSchema),z.lazy(() => EventLogCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => EventLogUpsertWithWhereUniqueWithoutUserInputSchema),z.lazy(() => EventLogUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => EventLogCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => EventLogWhereUniqueInputSchema),z.lazy(() => EventLogWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => EventLogWhereUniqueInputSchema),z.lazy(() => EventLogWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => EventLogWhereUniqueInputSchema),z.lazy(() => EventLogWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => EventLogWhereUniqueInputSchema),z.lazy(() => EventLogWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => EventLogUpdateWithWhereUniqueWithoutUserInputSchema),z.lazy(() => EventLogUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => EventLogUpdateManyWithWhereWithoutUserInputSchema),z.lazy(() => EventLogUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => EventLogScalarWhereInputSchema),z.lazy(() => EventLogScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const UserCreateNestedOneWithoutHackerInputSchema: z.ZodType<Prisma.UserCreateNestedOneWithoutHackerInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutHackerInputSchema),z.lazy(() => UserUncheckedCreateWithoutHackerInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutHackerInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional()
}).strict();

export const UserCreateNestedOneWithoutReviewerInputSchema: z.ZodType<Prisma.UserCreateNestedOneWithoutReviewerInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutReviewerInputSchema),z.lazy(() => UserUncheckedCreateWithoutReviewerInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutReviewerInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional()
}).strict();

export const FloatFieldUpdateOperationsInputSchema: z.ZodType<Prisma.FloatFieldUpdateOperationsInput> = z.object({
  set: z.number().optional(),
  increment: z.number().optional(),
  decrement: z.number().optional(),
  multiply: z.number().optional(),
  divide: z.number().optional()
}).strict();

export const UserUpdateOneRequiredWithoutHackerNestedInputSchema: z.ZodType<Prisma.UserUpdateOneRequiredWithoutHackerNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutHackerInputSchema),z.lazy(() => UserUncheckedCreateWithoutHackerInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutHackerInputSchema).optional(),
  upsert: z.lazy(() => UserUpsertWithoutHackerInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => UserUpdateToOneWithWhereWithoutHackerInputSchema),z.lazy(() => UserUpdateWithoutHackerInputSchema),z.lazy(() => UserUncheckedUpdateWithoutHackerInputSchema) ]).optional(),
}).strict();

export const UserUpdateOneRequiredWithoutReviewerNestedInputSchema: z.ZodType<Prisma.UserUpdateOneRequiredWithoutReviewerNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutReviewerInputSchema),z.lazy(() => UserUncheckedCreateWithoutReviewerInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutReviewerInputSchema).optional(),
  upsert: z.lazy(() => UserUpsertWithoutReviewerInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => UserUpdateToOneWithWhereWithoutReviewerInputSchema),z.lazy(() => UserUpdateWithoutReviewerInputSchema),z.lazy(() => UserUncheckedUpdateWithoutReviewerInputSchema) ]).optional(),
}).strict();

export const UserCreateNestedOneWithoutEventLogInputSchema: z.ZodType<Prisma.UserCreateNestedOneWithoutEventLogInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutEventLogInputSchema),z.lazy(() => UserUncheckedCreateWithoutEventLogInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutEventLogInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional()
}).strict();

export const UserUpdateOneRequiredWithoutEventLogNestedInputSchema: z.ZodType<Prisma.UserUpdateOneRequiredWithoutEventLogNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutEventLogInputSchema),z.lazy(() => UserUncheckedCreateWithoutEventLogInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutEventLogInputSchema).optional(),
  upsert: z.lazy(() => UserUpsertWithoutEventLogInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => UserUpdateToOneWithWhereWithoutEventLogInputSchema),z.lazy(() => UserUpdateWithoutEventLogInputSchema),z.lazy(() => UserUncheckedUpdateWithoutEventLogInputSchema) ]).optional(),
}).strict();

export const DH10ApplicationCreateworkshopChoicesInputSchema: z.ZodType<Prisma.DH10ApplicationCreateworkshopChoicesInput> = z.object({
  set: z.string().array()
}).strict();

export const UserCreateNestedOneWithoutDh10applicationInputSchema: z.ZodType<Prisma.UserCreateNestedOneWithoutDh10applicationInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutDh10applicationInputSchema),z.lazy(() => UserUncheckedCreateWithoutDh10applicationInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutDh10applicationInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional()
}).strict();

export const UserUncheckedCreateNestedOneWithoutDh10applicationInputSchema: z.ZodType<Prisma.UserUncheckedCreateNestedOneWithoutDh10applicationInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutDh10applicationInputSchema),z.lazy(() => UserUncheckedCreateWithoutDh10applicationInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutDh10applicationInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional()
}).strict();

export const BoolFieldUpdateOperationsInputSchema: z.ZodType<Prisma.BoolFieldUpdateOperationsInput> = z.object({
  set: z.boolean().optional()
}).strict();

export const DH10ApplicationUpdateworkshopChoicesInputSchema: z.ZodType<Prisma.DH10ApplicationUpdateworkshopChoicesInput> = z.object({
  set: z.string().array().optional()
}).strict();

export const UserUpdateOneWithoutDh10applicationNestedInputSchema: z.ZodType<Prisma.UserUpdateOneWithoutDh10applicationNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutDh10applicationInputSchema),z.lazy(() => UserUncheckedCreateWithoutDh10applicationInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutDh10applicationInputSchema).optional(),
  upsert: z.lazy(() => UserUpsertWithoutDh10applicationInputSchema).optional(),
  disconnect: z.union([ z.boolean(),z.lazy(() => UserWhereInputSchema) ]).optional(),
  delete: z.union([ z.boolean(),z.lazy(() => UserWhereInputSchema) ]).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => UserUpdateToOneWithWhereWithoutDh10applicationInputSchema),z.lazy(() => UserUpdateWithoutDh10applicationInputSchema),z.lazy(() => UserUncheckedUpdateWithoutDh10applicationInputSchema) ]).optional(),
}).strict();

export const UserUncheckedUpdateOneWithoutDh10applicationNestedInputSchema: z.ZodType<Prisma.UserUncheckedUpdateOneWithoutDh10applicationNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutDh10applicationInputSchema),z.lazy(() => UserUncheckedCreateWithoutDh10applicationInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutDh10applicationInputSchema).optional(),
  upsert: z.lazy(() => UserUpsertWithoutDh10applicationInputSchema).optional(),
  disconnect: z.union([ z.boolean(),z.lazy(() => UserWhereInputSchema) ]).optional(),
  delete: z.union([ z.boolean(),z.lazy(() => UserWhereInputSchema) ]).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => UserUpdateToOneWithWhereWithoutDh10applicationInputSchema),z.lazy(() => UserUpdateWithoutDh10applicationInputSchema),z.lazy(() => UserUncheckedUpdateWithoutDh10applicationInputSchema) ]).optional(),
}).strict();

export const NestedStringFilterSchema: z.ZodType<Prisma.NestedStringFilter> = z.object({
  equals: z.string().optional(),
  in: z.string().array().optional(),
  notIn: z.string().array().optional(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringFilterSchema) ]).optional(),
}).strict();

export const NestedStringNullableFilterSchema: z.ZodType<Prisma.NestedStringNullableFilter> = z.object({
  equals: z.string().optional().nullable(),
  in: z.string().array().optional().nullable(),
  notIn: z.string().array().optional().nullable(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringNullableFilterSchema) ]).optional().nullable(),
}).strict();

export const NestedIntNullableFilterSchema: z.ZodType<Prisma.NestedIntNullableFilter> = z.object({
  equals: z.number().optional().nullable(),
  in: z.number().array().optional().nullable(),
  notIn: z.number().array().optional().nullable(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntNullableFilterSchema) ]).optional().nullable(),
}).strict();

export const NestedStringWithAggregatesFilterSchema: z.ZodType<Prisma.NestedStringWithAggregatesFilter> = z.object({
  equals: z.string().optional(),
  in: z.string().array().optional(),
  notIn: z.string().array().optional(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedStringFilterSchema).optional(),
  _max: z.lazy(() => NestedStringFilterSchema).optional()
}).strict();

export const NestedIntFilterSchema: z.ZodType<Prisma.NestedIntFilter> = z.object({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntFilterSchema) ]).optional(),
}).strict();

export const NestedStringNullableWithAggregatesFilterSchema: z.ZodType<Prisma.NestedStringNullableWithAggregatesFilter> = z.object({
  equals: z.string().optional().nullable(),
  in: z.string().array().optional().nullable(),
  notIn: z.string().array().optional().nullable(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringNullableWithAggregatesFilterSchema) ]).optional().nullable(),
  _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _min: z.lazy(() => NestedStringNullableFilterSchema).optional(),
  _max: z.lazy(() => NestedStringNullableFilterSchema).optional()
}).strict();

export const NestedIntNullableWithAggregatesFilterSchema: z.ZodType<Prisma.NestedIntNullableWithAggregatesFilter> = z.object({
  equals: z.number().optional().nullable(),
  in: z.number().array().optional().nullable(),
  notIn: z.number().array().optional().nullable(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntNullableWithAggregatesFilterSchema) ]).optional().nullable(),
  _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _avg: z.lazy(() => NestedFloatNullableFilterSchema).optional(),
  _sum: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _min: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _max: z.lazy(() => NestedIntNullableFilterSchema).optional()
}).strict();

export const NestedFloatNullableFilterSchema: z.ZodType<Prisma.NestedFloatNullableFilter> = z.object({
  equals: z.number().optional().nullable(),
  in: z.number().array().optional().nullable(),
  notIn: z.number().array().optional().nullable(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedFloatNullableFilterSchema) ]).optional().nullable(),
}).strict();

export const NestedDateTimeFilterSchema: z.ZodType<Prisma.NestedDateTimeFilter> = z.object({
  equals: z.coerce.date().optional(),
  in: z.coerce.date().array().optional(),
  notIn: z.coerce.date().array().optional(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([ z.coerce.date(),z.lazy(() => NestedDateTimeFilterSchema) ]).optional(),
}).strict();

export const NestedDateTimeWithAggregatesFilterSchema: z.ZodType<Prisma.NestedDateTimeWithAggregatesFilter> = z.object({
  equals: z.coerce.date().optional(),
  in: z.coerce.date().array().optional(),
  notIn: z.coerce.date().array().optional(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([ z.coerce.date(),z.lazy(() => NestedDateTimeWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedDateTimeFilterSchema).optional(),
  _max: z.lazy(() => NestedDateTimeFilterSchema).optional()
}).strict();

export const NestedDateTimeNullableFilterSchema: z.ZodType<Prisma.NestedDateTimeNullableFilter> = z.object({
  equals: z.coerce.date().optional().nullable(),
  in: z.coerce.date().array().optional().nullable(),
  notIn: z.coerce.date().array().optional().nullable(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([ z.coerce.date(),z.lazy(() => NestedDateTimeNullableFilterSchema) ]).optional().nullable(),
}).strict();

export const NestedEnumStatusFilterSchema: z.ZodType<Prisma.NestedEnumStatusFilter> = z.object({
  equals: z.lazy(() => StatusSchema).optional(),
  in: z.lazy(() => StatusSchema).array().optional(),
  notIn: z.lazy(() => StatusSchema).array().optional(),
  not: z.union([ z.lazy(() => StatusSchema),z.lazy(() => NestedEnumStatusFilterSchema) ]).optional(),
}).strict();

export const NestedDateTimeNullableWithAggregatesFilterSchema: z.ZodType<Prisma.NestedDateTimeNullableWithAggregatesFilter> = z.object({
  equals: z.coerce.date().optional().nullable(),
  in: z.coerce.date().array().optional().nullable(),
  notIn: z.coerce.date().array().optional().nullable(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([ z.coerce.date(),z.lazy(() => NestedDateTimeNullableWithAggregatesFilterSchema) ]).optional().nullable(),
  _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _min: z.lazy(() => NestedDateTimeNullableFilterSchema).optional(),
  _max: z.lazy(() => NestedDateTimeNullableFilterSchema).optional()
}).strict();

export const NestedEnumStatusWithAggregatesFilterSchema: z.ZodType<Prisma.NestedEnumStatusWithAggregatesFilter> = z.object({
  equals: z.lazy(() => StatusSchema).optional(),
  in: z.lazy(() => StatusSchema).array().optional(),
  notIn: z.lazy(() => StatusSchema).array().optional(),
  not: z.union([ z.lazy(() => StatusSchema),z.lazy(() => NestedEnumStatusWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumStatusFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumStatusFilterSchema).optional()
}).strict();

export const NestedIntWithAggregatesFilterSchema: z.ZodType<Prisma.NestedIntWithAggregatesFilter> = z.object({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _avg: z.lazy(() => NestedFloatFilterSchema).optional(),
  _sum: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedIntFilterSchema).optional(),
  _max: z.lazy(() => NestedIntFilterSchema).optional()
}).strict();

export const NestedFloatFilterSchema: z.ZodType<Prisma.NestedFloatFilter> = z.object({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedFloatFilterSchema) ]).optional(),
}).strict();

export const NestedFloatWithAggregatesFilterSchema: z.ZodType<Prisma.NestedFloatWithAggregatesFilter> = z.object({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedFloatWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _avg: z.lazy(() => NestedFloatFilterSchema).optional(),
  _sum: z.lazy(() => NestedFloatFilterSchema).optional(),
  _min: z.lazy(() => NestedFloatFilterSchema).optional(),
  _max: z.lazy(() => NestedFloatFilterSchema).optional()
}).strict();

export const NestedBoolFilterSchema: z.ZodType<Prisma.NestedBoolFilter> = z.object({
  equals: z.boolean().optional(),
  not: z.union([ z.boolean(),z.lazy(() => NestedBoolFilterSchema) ]).optional(),
}).strict();

export const NestedBoolWithAggregatesFilterSchema: z.ZodType<Prisma.NestedBoolWithAggregatesFilter> = z.object({
  equals: z.boolean().optional(),
  not: z.union([ z.boolean(),z.lazy(() => NestedBoolWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedBoolFilterSchema).optional(),
  _max: z.lazy(() => NestedBoolFilterSchema).optional()
}).strict();

export const UserCreateWithoutAccountsInputSchema: z.ZodType<Prisma.UserCreateWithoutAccountsInput> = z.object({
  id: z.string().cuid().optional(),
  name: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  emailVerified: z.coerce.date().optional().nullable(),
  image: z.string().optional().nullable(),
  typeform_response_id: z.string().optional().nullable(),
  role: z.union([ z.lazy(() => UserCreateroleInputSchema),z.lazy(() => RoleSchema).array() ]).optional(),
  status: z.lazy(() => StatusSchema).optional(),
  qrcode: z.number().int().optional().nullable(),
  mealsTaken: z.number().int().optional(),
  lastMealTaken: z.coerce.date().optional().nullable(),
  sessions: z.lazy(() => SessionCreateNestedManyWithoutUserInputSchema).optional(),
  hacker: z.lazy(() => ReviewCreateNestedManyWithoutHackerInputSchema).optional(),
  reviewer: z.lazy(() => ReviewCreateNestedManyWithoutReviewerInputSchema).optional(),
  EventLog: z.lazy(() => EventLogCreateNestedManyWithoutUserInputSchema).optional(),
  dh10application: z.lazy(() => DH10ApplicationCreateNestedOneWithoutUserInputSchema).optional()
}).strict();

export const UserUncheckedCreateWithoutAccountsInputSchema: z.ZodType<Prisma.UserUncheckedCreateWithoutAccountsInput> = z.object({
  id: z.string().cuid().optional(),
  name: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  emailVerified: z.coerce.date().optional().nullable(),
  image: z.string().optional().nullable(),
  typeform_response_id: z.string().optional().nullable(),
  role: z.union([ z.lazy(() => UserCreateroleInputSchema),z.lazy(() => RoleSchema).array() ]).optional(),
  status: z.lazy(() => StatusSchema).optional(),
  qrcode: z.number().int().optional().nullable(),
  mealsTaken: z.number().int().optional(),
  lastMealTaken: z.coerce.date().optional().nullable(),
  dH10ApplicationId: z.string().optional().nullable(),
  sessions: z.lazy(() => SessionUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  hacker: z.lazy(() => ReviewUncheckedCreateNestedManyWithoutHackerInputSchema).optional(),
  reviewer: z.lazy(() => ReviewUncheckedCreateNestedManyWithoutReviewerInputSchema).optional(),
  EventLog: z.lazy(() => EventLogUncheckedCreateNestedManyWithoutUserInputSchema).optional()
}).strict();

export const UserCreateOrConnectWithoutAccountsInputSchema: z.ZodType<Prisma.UserCreateOrConnectWithoutAccountsInput> = z.object({
  where: z.lazy(() => UserWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserCreateWithoutAccountsInputSchema),z.lazy(() => UserUncheckedCreateWithoutAccountsInputSchema) ]),
}).strict();

export const UserUpsertWithoutAccountsInputSchema: z.ZodType<Prisma.UserUpsertWithoutAccountsInput> = z.object({
  update: z.union([ z.lazy(() => UserUpdateWithoutAccountsInputSchema),z.lazy(() => UserUncheckedUpdateWithoutAccountsInputSchema) ]),
  create: z.union([ z.lazy(() => UserCreateWithoutAccountsInputSchema),z.lazy(() => UserUncheckedCreateWithoutAccountsInputSchema) ]),
  where: z.lazy(() => UserWhereInputSchema).optional()
}).strict();

export const UserUpdateToOneWithWhereWithoutAccountsInputSchema: z.ZodType<Prisma.UserUpdateToOneWithWhereWithoutAccountsInput> = z.object({
  where: z.lazy(() => UserWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => UserUpdateWithoutAccountsInputSchema),z.lazy(() => UserUncheckedUpdateWithoutAccountsInputSchema) ]),
}).strict();

export const UserUpdateWithoutAccountsInputSchema: z.ZodType<Prisma.UserUpdateWithoutAccountsInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  email: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  emailVerified: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  image: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  typeform_response_id: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  role: z.union([ z.lazy(() => UserUpdateroleInputSchema),z.lazy(() => RoleSchema).array() ]).optional(),
  status: z.union([ z.lazy(() => StatusSchema),z.lazy(() => EnumStatusFieldUpdateOperationsInputSchema) ]).optional(),
  qrcode: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  mealsTaken: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  lastMealTaken: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  sessions: z.lazy(() => SessionUpdateManyWithoutUserNestedInputSchema).optional(),
  hacker: z.lazy(() => ReviewUpdateManyWithoutHackerNestedInputSchema).optional(),
  reviewer: z.lazy(() => ReviewUpdateManyWithoutReviewerNestedInputSchema).optional(),
  EventLog: z.lazy(() => EventLogUpdateManyWithoutUserNestedInputSchema).optional(),
  dh10application: z.lazy(() => DH10ApplicationUpdateOneWithoutUserNestedInputSchema).optional()
}).strict();

export const UserUncheckedUpdateWithoutAccountsInputSchema: z.ZodType<Prisma.UserUncheckedUpdateWithoutAccountsInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  email: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  emailVerified: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  image: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  typeform_response_id: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  role: z.union([ z.lazy(() => UserUpdateroleInputSchema),z.lazy(() => RoleSchema).array() ]).optional(),
  status: z.union([ z.lazy(() => StatusSchema),z.lazy(() => EnumStatusFieldUpdateOperationsInputSchema) ]).optional(),
  qrcode: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  mealsTaken: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  lastMealTaken: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  dH10ApplicationId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  sessions: z.lazy(() => SessionUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  hacker: z.lazy(() => ReviewUncheckedUpdateManyWithoutHackerNestedInputSchema).optional(),
  reviewer: z.lazy(() => ReviewUncheckedUpdateManyWithoutReviewerNestedInputSchema).optional(),
  EventLog: z.lazy(() => EventLogUncheckedUpdateManyWithoutUserNestedInputSchema).optional()
}).strict();

export const UserCreateWithoutSessionsInputSchema: z.ZodType<Prisma.UserCreateWithoutSessionsInput> = z.object({
  id: z.string().cuid().optional(),
  name: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  emailVerified: z.coerce.date().optional().nullable(),
  image: z.string().optional().nullable(),
  typeform_response_id: z.string().optional().nullable(),
  role: z.union([ z.lazy(() => UserCreateroleInputSchema),z.lazy(() => RoleSchema).array() ]).optional(),
  status: z.lazy(() => StatusSchema).optional(),
  qrcode: z.number().int().optional().nullable(),
  mealsTaken: z.number().int().optional(),
  lastMealTaken: z.coerce.date().optional().nullable(),
  accounts: z.lazy(() => AccountCreateNestedManyWithoutUserInputSchema).optional(),
  hacker: z.lazy(() => ReviewCreateNestedManyWithoutHackerInputSchema).optional(),
  reviewer: z.lazy(() => ReviewCreateNestedManyWithoutReviewerInputSchema).optional(),
  EventLog: z.lazy(() => EventLogCreateNestedManyWithoutUserInputSchema).optional(),
  dh10application: z.lazy(() => DH10ApplicationCreateNestedOneWithoutUserInputSchema).optional()
}).strict();

export const UserUncheckedCreateWithoutSessionsInputSchema: z.ZodType<Prisma.UserUncheckedCreateWithoutSessionsInput> = z.object({
  id: z.string().cuid().optional(),
  name: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  emailVerified: z.coerce.date().optional().nullable(),
  image: z.string().optional().nullable(),
  typeform_response_id: z.string().optional().nullable(),
  role: z.union([ z.lazy(() => UserCreateroleInputSchema),z.lazy(() => RoleSchema).array() ]).optional(),
  status: z.lazy(() => StatusSchema).optional(),
  qrcode: z.number().int().optional().nullable(),
  mealsTaken: z.number().int().optional(),
  lastMealTaken: z.coerce.date().optional().nullable(),
  dH10ApplicationId: z.string().optional().nullable(),
  accounts: z.lazy(() => AccountUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  hacker: z.lazy(() => ReviewUncheckedCreateNestedManyWithoutHackerInputSchema).optional(),
  reviewer: z.lazy(() => ReviewUncheckedCreateNestedManyWithoutReviewerInputSchema).optional(),
  EventLog: z.lazy(() => EventLogUncheckedCreateNestedManyWithoutUserInputSchema).optional()
}).strict();

export const UserCreateOrConnectWithoutSessionsInputSchema: z.ZodType<Prisma.UserCreateOrConnectWithoutSessionsInput> = z.object({
  where: z.lazy(() => UserWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserCreateWithoutSessionsInputSchema),z.lazy(() => UserUncheckedCreateWithoutSessionsInputSchema) ]),
}).strict();

export const UserUpsertWithoutSessionsInputSchema: z.ZodType<Prisma.UserUpsertWithoutSessionsInput> = z.object({
  update: z.union([ z.lazy(() => UserUpdateWithoutSessionsInputSchema),z.lazy(() => UserUncheckedUpdateWithoutSessionsInputSchema) ]),
  create: z.union([ z.lazy(() => UserCreateWithoutSessionsInputSchema),z.lazy(() => UserUncheckedCreateWithoutSessionsInputSchema) ]),
  where: z.lazy(() => UserWhereInputSchema).optional()
}).strict();

export const UserUpdateToOneWithWhereWithoutSessionsInputSchema: z.ZodType<Prisma.UserUpdateToOneWithWhereWithoutSessionsInput> = z.object({
  where: z.lazy(() => UserWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => UserUpdateWithoutSessionsInputSchema),z.lazy(() => UserUncheckedUpdateWithoutSessionsInputSchema) ]),
}).strict();

export const UserUpdateWithoutSessionsInputSchema: z.ZodType<Prisma.UserUpdateWithoutSessionsInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  email: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  emailVerified: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  image: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  typeform_response_id: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  role: z.union([ z.lazy(() => UserUpdateroleInputSchema),z.lazy(() => RoleSchema).array() ]).optional(),
  status: z.union([ z.lazy(() => StatusSchema),z.lazy(() => EnumStatusFieldUpdateOperationsInputSchema) ]).optional(),
  qrcode: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  mealsTaken: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  lastMealTaken: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  accounts: z.lazy(() => AccountUpdateManyWithoutUserNestedInputSchema).optional(),
  hacker: z.lazy(() => ReviewUpdateManyWithoutHackerNestedInputSchema).optional(),
  reviewer: z.lazy(() => ReviewUpdateManyWithoutReviewerNestedInputSchema).optional(),
  EventLog: z.lazy(() => EventLogUpdateManyWithoutUserNestedInputSchema).optional(),
  dh10application: z.lazy(() => DH10ApplicationUpdateOneWithoutUserNestedInputSchema).optional()
}).strict();

export const UserUncheckedUpdateWithoutSessionsInputSchema: z.ZodType<Prisma.UserUncheckedUpdateWithoutSessionsInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  email: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  emailVerified: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  image: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  typeform_response_id: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  role: z.union([ z.lazy(() => UserUpdateroleInputSchema),z.lazy(() => RoleSchema).array() ]).optional(),
  status: z.union([ z.lazy(() => StatusSchema),z.lazy(() => EnumStatusFieldUpdateOperationsInputSchema) ]).optional(),
  qrcode: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  mealsTaken: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  lastMealTaken: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  dH10ApplicationId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  accounts: z.lazy(() => AccountUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  hacker: z.lazy(() => ReviewUncheckedUpdateManyWithoutHackerNestedInputSchema).optional(),
  reviewer: z.lazy(() => ReviewUncheckedUpdateManyWithoutReviewerNestedInputSchema).optional(),
  EventLog: z.lazy(() => EventLogUncheckedUpdateManyWithoutUserNestedInputSchema).optional()
}).strict();

export const AccountCreateWithoutUserInputSchema: z.ZodType<Prisma.AccountCreateWithoutUserInput> = z.object({
  id: z.string().cuid().optional(),
  type: z.string(),
  provider: z.string(),
  providerAccountId: z.string(),
  refresh_token: z.string().optional().nullable(),
  refresh_token_expires_in: z.number().int().optional().nullable(),
  access_token: z.string().optional().nullable(),
  expires_at: z.number().int().optional().nullable(),
  ext_expires_in: z.number().int().optional().nullable(),
  oauth_token_secret: z.string().optional().nullable(),
  oauth_token: z.string().optional().nullable(),
  token_type: z.string().optional().nullable(),
  scope: z.string().optional().nullable(),
  id_token: z.string().optional().nullable(),
  session_state: z.string().optional().nullable()
}).strict();

export const AccountUncheckedCreateWithoutUserInputSchema: z.ZodType<Prisma.AccountUncheckedCreateWithoutUserInput> = z.object({
  id: z.string().cuid().optional(),
  type: z.string(),
  provider: z.string(),
  providerAccountId: z.string(),
  refresh_token: z.string().optional().nullable(),
  refresh_token_expires_in: z.number().int().optional().nullable(),
  access_token: z.string().optional().nullable(),
  expires_at: z.number().int().optional().nullable(),
  ext_expires_in: z.number().int().optional().nullable(),
  oauth_token_secret: z.string().optional().nullable(),
  oauth_token: z.string().optional().nullable(),
  token_type: z.string().optional().nullable(),
  scope: z.string().optional().nullable(),
  id_token: z.string().optional().nullable(),
  session_state: z.string().optional().nullable()
}).strict();

export const AccountCreateOrConnectWithoutUserInputSchema: z.ZodType<Prisma.AccountCreateOrConnectWithoutUserInput> = z.object({
  where: z.lazy(() => AccountWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => AccountCreateWithoutUserInputSchema),z.lazy(() => AccountUncheckedCreateWithoutUserInputSchema) ]),
}).strict();

export const AccountCreateManyUserInputEnvelopeSchema: z.ZodType<Prisma.AccountCreateManyUserInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => AccountCreateManyUserInputSchema),z.lazy(() => AccountCreateManyUserInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export const SessionCreateWithoutUserInputSchema: z.ZodType<Prisma.SessionCreateWithoutUserInput> = z.object({
  id: z.string().cuid().optional(),
  sessionToken: z.string(),
  expires: z.coerce.date()
}).strict();

export const SessionUncheckedCreateWithoutUserInputSchema: z.ZodType<Prisma.SessionUncheckedCreateWithoutUserInput> = z.object({
  id: z.string().cuid().optional(),
  sessionToken: z.string(),
  expires: z.coerce.date()
}).strict();

export const SessionCreateOrConnectWithoutUserInputSchema: z.ZodType<Prisma.SessionCreateOrConnectWithoutUserInput> = z.object({
  where: z.lazy(() => SessionWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => SessionCreateWithoutUserInputSchema),z.lazy(() => SessionUncheckedCreateWithoutUserInputSchema) ]),
}).strict();

export const SessionCreateManyUserInputEnvelopeSchema: z.ZodType<Prisma.SessionCreateManyUserInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => SessionCreateManyUserInputSchema),z.lazy(() => SessionCreateManyUserInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export const ReviewCreateWithoutHackerInputSchema: z.ZodType<Prisma.ReviewCreateWithoutHackerInput> = z.object({
  id: z.string().cuid().optional(),
  mark: z.number().optional(),
  reviewer: z.lazy(() => UserCreateNestedOneWithoutReviewerInputSchema)
}).strict();

export const ReviewUncheckedCreateWithoutHackerInputSchema: z.ZodType<Prisma.ReviewUncheckedCreateWithoutHackerInput> = z.object({
  id: z.string().cuid().optional(),
  reviewerId: z.string(),
  mark: z.number().optional()
}).strict();

export const ReviewCreateOrConnectWithoutHackerInputSchema: z.ZodType<Prisma.ReviewCreateOrConnectWithoutHackerInput> = z.object({
  where: z.lazy(() => ReviewWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => ReviewCreateWithoutHackerInputSchema),z.lazy(() => ReviewUncheckedCreateWithoutHackerInputSchema) ]),
}).strict();

export const ReviewCreateManyHackerInputEnvelopeSchema: z.ZodType<Prisma.ReviewCreateManyHackerInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => ReviewCreateManyHackerInputSchema),z.lazy(() => ReviewCreateManyHackerInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export const ReviewCreateWithoutReviewerInputSchema: z.ZodType<Prisma.ReviewCreateWithoutReviewerInput> = z.object({
  id: z.string().cuid().optional(),
  mark: z.number().optional(),
  hacker: z.lazy(() => UserCreateNestedOneWithoutHackerInputSchema)
}).strict();

export const ReviewUncheckedCreateWithoutReviewerInputSchema: z.ZodType<Prisma.ReviewUncheckedCreateWithoutReviewerInput> = z.object({
  id: z.string().cuid().optional(),
  hackerId: z.string(),
  mark: z.number().optional()
}).strict();

export const ReviewCreateOrConnectWithoutReviewerInputSchema: z.ZodType<Prisma.ReviewCreateOrConnectWithoutReviewerInput> = z.object({
  where: z.lazy(() => ReviewWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => ReviewCreateWithoutReviewerInputSchema),z.lazy(() => ReviewUncheckedCreateWithoutReviewerInputSchema) ]),
}).strict();

export const ReviewCreateManyReviewerInputEnvelopeSchema: z.ZodType<Prisma.ReviewCreateManyReviewerInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => ReviewCreateManyReviewerInputSchema),z.lazy(() => ReviewCreateManyReviewerInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export const EventLogCreateWithoutUserInputSchema: z.ZodType<Prisma.EventLogCreateWithoutUserInput> = z.object({
  id: z.string().cuid().optional(),
  timestamp: z.coerce.date().optional(),
  event: z.string()
}).strict();

export const EventLogUncheckedCreateWithoutUserInputSchema: z.ZodType<Prisma.EventLogUncheckedCreateWithoutUserInput> = z.object({
  id: z.string().cuid().optional(),
  timestamp: z.coerce.date().optional(),
  event: z.string()
}).strict();

export const EventLogCreateOrConnectWithoutUserInputSchema: z.ZodType<Prisma.EventLogCreateOrConnectWithoutUserInput> = z.object({
  where: z.lazy(() => EventLogWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => EventLogCreateWithoutUserInputSchema),z.lazy(() => EventLogUncheckedCreateWithoutUserInputSchema) ]),
}).strict();

export const EventLogCreateManyUserInputEnvelopeSchema: z.ZodType<Prisma.EventLogCreateManyUserInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => EventLogCreateManyUserInputSchema),z.lazy(() => EventLogCreateManyUserInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export const DH10ApplicationCreateWithoutUserInputSchema: z.ZodType<Prisma.DH10ApplicationCreateWithoutUserInput> = z.object({
  id: z.string().cuid().optional(),
  firstName: z.string(),
  lastName: z.string(),
  birthday: z.coerce.date(),
  studyEnrolledPostSecondary: z.boolean(),
  studyLocation: z.string(),
  studyDegree: z.string(),
  studyMajor: z.string(),
  studyYearOfStudy: z.number().int(),
  studyExpectedGraduation: z.coerce.date(),
  previousHackathonsCount: z.number().int(),
  longAnswerChange: z.string(),
  longAnswerExperience: z.string(),
  longAnswerTech: z.string(),
  longAnswerMeaning: z.string(),
  longAnswerFuture: z.string(),
  longAnswerMagic: z.string(),
  socialText: z.string().optional().nullable(),
  interests: z.string().optional().nullable(),
  tshirtSize: z.string(),
  hackerKind: z.string(),
  alreadyHaveTeam: z.boolean(),
  workshopChoices: z.union([ z.lazy(() => DH10ApplicationCreateworkshopChoicesInputSchema),z.string().array() ]).optional(),
  considerCoffee: z.boolean(),
  discoverdFrom: z.string(),
  gender: z.string(),
  race: z.string(),
  emergencyContactName: z.string(),
  emergencyContactPhone: z.string(),
  emergencyContactRelation: z.string(),
  agreeToMLHCodeOfConduct: z.boolean(),
  agreeToMLHPrivacyPolicy: z.boolean(),
  agreeToMLHCommunications: z.boolean()
}).strict();

export const DH10ApplicationUncheckedCreateWithoutUserInputSchema: z.ZodType<Prisma.DH10ApplicationUncheckedCreateWithoutUserInput> = z.object({
  id: z.string().cuid().optional(),
  firstName: z.string(),
  lastName: z.string(),
  birthday: z.coerce.date(),
  studyEnrolledPostSecondary: z.boolean(),
  studyLocation: z.string(),
  studyDegree: z.string(),
  studyMajor: z.string(),
  studyYearOfStudy: z.number().int(),
  studyExpectedGraduation: z.coerce.date(),
  previousHackathonsCount: z.number().int(),
  longAnswerChange: z.string(),
  longAnswerExperience: z.string(),
  longAnswerTech: z.string(),
  longAnswerMeaning: z.string(),
  longAnswerFuture: z.string(),
  longAnswerMagic: z.string(),
  socialText: z.string().optional().nullable(),
  interests: z.string().optional().nullable(),
  tshirtSize: z.string(),
  hackerKind: z.string(),
  alreadyHaveTeam: z.boolean(),
  workshopChoices: z.union([ z.lazy(() => DH10ApplicationCreateworkshopChoicesInputSchema),z.string().array() ]).optional(),
  considerCoffee: z.boolean(),
  discoverdFrom: z.string(),
  gender: z.string(),
  race: z.string(),
  emergencyContactName: z.string(),
  emergencyContactPhone: z.string(),
  emergencyContactRelation: z.string(),
  agreeToMLHCodeOfConduct: z.boolean(),
  agreeToMLHPrivacyPolicy: z.boolean(),
  agreeToMLHCommunications: z.boolean()
}).strict();

export const DH10ApplicationCreateOrConnectWithoutUserInputSchema: z.ZodType<Prisma.DH10ApplicationCreateOrConnectWithoutUserInput> = z.object({
  where: z.lazy(() => DH10ApplicationWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => DH10ApplicationCreateWithoutUserInputSchema),z.lazy(() => DH10ApplicationUncheckedCreateWithoutUserInputSchema) ]),
}).strict();

export const AccountUpsertWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.AccountUpsertWithWhereUniqueWithoutUserInput> = z.object({
  where: z.lazy(() => AccountWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => AccountUpdateWithoutUserInputSchema),z.lazy(() => AccountUncheckedUpdateWithoutUserInputSchema) ]),
  create: z.union([ z.lazy(() => AccountCreateWithoutUserInputSchema),z.lazy(() => AccountUncheckedCreateWithoutUserInputSchema) ]),
}).strict();

export const AccountUpdateWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.AccountUpdateWithWhereUniqueWithoutUserInput> = z.object({
  where: z.lazy(() => AccountWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => AccountUpdateWithoutUserInputSchema),z.lazy(() => AccountUncheckedUpdateWithoutUserInputSchema) ]),
}).strict();

export const AccountUpdateManyWithWhereWithoutUserInputSchema: z.ZodType<Prisma.AccountUpdateManyWithWhereWithoutUserInput> = z.object({
  where: z.lazy(() => AccountScalarWhereInputSchema),
  data: z.union([ z.lazy(() => AccountUpdateManyMutationInputSchema),z.lazy(() => AccountUncheckedUpdateManyWithoutUserInputSchema) ]),
}).strict();

export const AccountScalarWhereInputSchema: z.ZodType<Prisma.AccountScalarWhereInput> = z.object({
  AND: z.union([ z.lazy(() => AccountScalarWhereInputSchema),z.lazy(() => AccountScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => AccountScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => AccountScalarWhereInputSchema),z.lazy(() => AccountScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  type: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  provider: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  providerAccountId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  refresh_token: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  refresh_token_expires_in: z.union([ z.lazy(() => IntNullableFilterSchema),z.number() ]).optional().nullable(),
  access_token: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  expires_at: z.union([ z.lazy(() => IntNullableFilterSchema),z.number() ]).optional().nullable(),
  ext_expires_in: z.union([ z.lazy(() => IntNullableFilterSchema),z.number() ]).optional().nullable(),
  oauth_token_secret: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  oauth_token: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  token_type: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  scope: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  id_token: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  session_state: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
}).strict();

export const SessionUpsertWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.SessionUpsertWithWhereUniqueWithoutUserInput> = z.object({
  where: z.lazy(() => SessionWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => SessionUpdateWithoutUserInputSchema),z.lazy(() => SessionUncheckedUpdateWithoutUserInputSchema) ]),
  create: z.union([ z.lazy(() => SessionCreateWithoutUserInputSchema),z.lazy(() => SessionUncheckedCreateWithoutUserInputSchema) ]),
}).strict();

export const SessionUpdateWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.SessionUpdateWithWhereUniqueWithoutUserInput> = z.object({
  where: z.lazy(() => SessionWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => SessionUpdateWithoutUserInputSchema),z.lazy(() => SessionUncheckedUpdateWithoutUserInputSchema) ]),
}).strict();

export const SessionUpdateManyWithWhereWithoutUserInputSchema: z.ZodType<Prisma.SessionUpdateManyWithWhereWithoutUserInput> = z.object({
  where: z.lazy(() => SessionScalarWhereInputSchema),
  data: z.union([ z.lazy(() => SessionUpdateManyMutationInputSchema),z.lazy(() => SessionUncheckedUpdateManyWithoutUserInputSchema) ]),
}).strict();

export const SessionScalarWhereInputSchema: z.ZodType<Prisma.SessionScalarWhereInput> = z.object({
  AND: z.union([ z.lazy(() => SessionScalarWhereInputSchema),z.lazy(() => SessionScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => SessionScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => SessionScalarWhereInputSchema),z.lazy(() => SessionScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  sessionToken: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  expires: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
}).strict();

export const ReviewUpsertWithWhereUniqueWithoutHackerInputSchema: z.ZodType<Prisma.ReviewUpsertWithWhereUniqueWithoutHackerInput> = z.object({
  where: z.lazy(() => ReviewWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => ReviewUpdateWithoutHackerInputSchema),z.lazy(() => ReviewUncheckedUpdateWithoutHackerInputSchema) ]),
  create: z.union([ z.lazy(() => ReviewCreateWithoutHackerInputSchema),z.lazy(() => ReviewUncheckedCreateWithoutHackerInputSchema) ]),
}).strict();

export const ReviewUpdateWithWhereUniqueWithoutHackerInputSchema: z.ZodType<Prisma.ReviewUpdateWithWhereUniqueWithoutHackerInput> = z.object({
  where: z.lazy(() => ReviewWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => ReviewUpdateWithoutHackerInputSchema),z.lazy(() => ReviewUncheckedUpdateWithoutHackerInputSchema) ]),
}).strict();

export const ReviewUpdateManyWithWhereWithoutHackerInputSchema: z.ZodType<Prisma.ReviewUpdateManyWithWhereWithoutHackerInput> = z.object({
  where: z.lazy(() => ReviewScalarWhereInputSchema),
  data: z.union([ z.lazy(() => ReviewUpdateManyMutationInputSchema),z.lazy(() => ReviewUncheckedUpdateManyWithoutHackerInputSchema) ]),
}).strict();

export const ReviewScalarWhereInputSchema: z.ZodType<Prisma.ReviewScalarWhereInput> = z.object({
  AND: z.union([ z.lazy(() => ReviewScalarWhereInputSchema),z.lazy(() => ReviewScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => ReviewScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ReviewScalarWhereInputSchema),z.lazy(() => ReviewScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  hackerId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  reviewerId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  mark: z.union([ z.lazy(() => FloatFilterSchema),z.number() ]).optional(),
}).strict();

export const ReviewUpsertWithWhereUniqueWithoutReviewerInputSchema: z.ZodType<Prisma.ReviewUpsertWithWhereUniqueWithoutReviewerInput> = z.object({
  where: z.lazy(() => ReviewWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => ReviewUpdateWithoutReviewerInputSchema),z.lazy(() => ReviewUncheckedUpdateWithoutReviewerInputSchema) ]),
  create: z.union([ z.lazy(() => ReviewCreateWithoutReviewerInputSchema),z.lazy(() => ReviewUncheckedCreateWithoutReviewerInputSchema) ]),
}).strict();

export const ReviewUpdateWithWhereUniqueWithoutReviewerInputSchema: z.ZodType<Prisma.ReviewUpdateWithWhereUniqueWithoutReviewerInput> = z.object({
  where: z.lazy(() => ReviewWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => ReviewUpdateWithoutReviewerInputSchema),z.lazy(() => ReviewUncheckedUpdateWithoutReviewerInputSchema) ]),
}).strict();

export const ReviewUpdateManyWithWhereWithoutReviewerInputSchema: z.ZodType<Prisma.ReviewUpdateManyWithWhereWithoutReviewerInput> = z.object({
  where: z.lazy(() => ReviewScalarWhereInputSchema),
  data: z.union([ z.lazy(() => ReviewUpdateManyMutationInputSchema),z.lazy(() => ReviewUncheckedUpdateManyWithoutReviewerInputSchema) ]),
}).strict();

export const EventLogUpsertWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.EventLogUpsertWithWhereUniqueWithoutUserInput> = z.object({
  where: z.lazy(() => EventLogWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => EventLogUpdateWithoutUserInputSchema),z.lazy(() => EventLogUncheckedUpdateWithoutUserInputSchema) ]),
  create: z.union([ z.lazy(() => EventLogCreateWithoutUserInputSchema),z.lazy(() => EventLogUncheckedCreateWithoutUserInputSchema) ]),
}).strict();

export const EventLogUpdateWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.EventLogUpdateWithWhereUniqueWithoutUserInput> = z.object({
  where: z.lazy(() => EventLogWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => EventLogUpdateWithoutUserInputSchema),z.lazy(() => EventLogUncheckedUpdateWithoutUserInputSchema) ]),
}).strict();

export const EventLogUpdateManyWithWhereWithoutUserInputSchema: z.ZodType<Prisma.EventLogUpdateManyWithWhereWithoutUserInput> = z.object({
  where: z.lazy(() => EventLogScalarWhereInputSchema),
  data: z.union([ z.lazy(() => EventLogUpdateManyMutationInputSchema),z.lazy(() => EventLogUncheckedUpdateManyWithoutUserInputSchema) ]),
}).strict();

export const EventLogScalarWhereInputSchema: z.ZodType<Prisma.EventLogScalarWhereInput> = z.object({
  AND: z.union([ z.lazy(() => EventLogScalarWhereInputSchema),z.lazy(() => EventLogScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => EventLogScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => EventLogScalarWhereInputSchema),z.lazy(() => EventLogScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  timestamp: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  event: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
}).strict();

export const DH10ApplicationUpsertWithoutUserInputSchema: z.ZodType<Prisma.DH10ApplicationUpsertWithoutUserInput> = z.object({
  update: z.union([ z.lazy(() => DH10ApplicationUpdateWithoutUserInputSchema),z.lazy(() => DH10ApplicationUncheckedUpdateWithoutUserInputSchema) ]),
  create: z.union([ z.lazy(() => DH10ApplicationCreateWithoutUserInputSchema),z.lazy(() => DH10ApplicationUncheckedCreateWithoutUserInputSchema) ]),
  where: z.lazy(() => DH10ApplicationWhereInputSchema).optional()
}).strict();

export const DH10ApplicationUpdateToOneWithWhereWithoutUserInputSchema: z.ZodType<Prisma.DH10ApplicationUpdateToOneWithWhereWithoutUserInput> = z.object({
  where: z.lazy(() => DH10ApplicationWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => DH10ApplicationUpdateWithoutUserInputSchema),z.lazy(() => DH10ApplicationUncheckedUpdateWithoutUserInputSchema) ]),
}).strict();

export const DH10ApplicationUpdateWithoutUserInputSchema: z.ZodType<Prisma.DH10ApplicationUpdateWithoutUserInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  firstName: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  lastName: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  birthday: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  studyEnrolledPostSecondary: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  studyLocation: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  studyDegree: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  studyMajor: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  studyYearOfStudy: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  studyExpectedGraduation: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  previousHackathonsCount: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  longAnswerChange: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  longAnswerExperience: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  longAnswerTech: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  longAnswerMeaning: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  longAnswerFuture: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  longAnswerMagic: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  socialText: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  interests: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  tshirtSize: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  hackerKind: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  alreadyHaveTeam: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  workshopChoices: z.union([ z.lazy(() => DH10ApplicationUpdateworkshopChoicesInputSchema),z.string().array() ]).optional(),
  considerCoffee: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  discoverdFrom: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  gender: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  race: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  emergencyContactName: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  emergencyContactPhone: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  emergencyContactRelation: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  agreeToMLHCodeOfConduct: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  agreeToMLHPrivacyPolicy: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  agreeToMLHCommunications: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const DH10ApplicationUncheckedUpdateWithoutUserInputSchema: z.ZodType<Prisma.DH10ApplicationUncheckedUpdateWithoutUserInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  firstName: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  lastName: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  birthday: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  studyEnrolledPostSecondary: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  studyLocation: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  studyDegree: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  studyMajor: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  studyYearOfStudy: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  studyExpectedGraduation: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  previousHackathonsCount: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  longAnswerChange: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  longAnswerExperience: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  longAnswerTech: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  longAnswerMeaning: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  longAnswerFuture: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  longAnswerMagic: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  socialText: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  interests: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  tshirtSize: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  hackerKind: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  alreadyHaveTeam: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  workshopChoices: z.union([ z.lazy(() => DH10ApplicationUpdateworkshopChoicesInputSchema),z.string().array() ]).optional(),
  considerCoffee: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  discoverdFrom: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  gender: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  race: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  emergencyContactName: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  emergencyContactPhone: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  emergencyContactRelation: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  agreeToMLHCodeOfConduct: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  agreeToMLHPrivacyPolicy: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  agreeToMLHCommunications: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const UserCreateWithoutHackerInputSchema: z.ZodType<Prisma.UserCreateWithoutHackerInput> = z.object({
  id: z.string().cuid().optional(),
  name: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  emailVerified: z.coerce.date().optional().nullable(),
  image: z.string().optional().nullable(),
  typeform_response_id: z.string().optional().nullable(),
  role: z.union([ z.lazy(() => UserCreateroleInputSchema),z.lazy(() => RoleSchema).array() ]).optional(),
  status: z.lazy(() => StatusSchema).optional(),
  qrcode: z.number().int().optional().nullable(),
  mealsTaken: z.number().int().optional(),
  lastMealTaken: z.coerce.date().optional().nullable(),
  accounts: z.lazy(() => AccountCreateNestedManyWithoutUserInputSchema).optional(),
  sessions: z.lazy(() => SessionCreateNestedManyWithoutUserInputSchema).optional(),
  reviewer: z.lazy(() => ReviewCreateNestedManyWithoutReviewerInputSchema).optional(),
  EventLog: z.lazy(() => EventLogCreateNestedManyWithoutUserInputSchema).optional(),
  dh10application: z.lazy(() => DH10ApplicationCreateNestedOneWithoutUserInputSchema).optional()
}).strict();

export const UserUncheckedCreateWithoutHackerInputSchema: z.ZodType<Prisma.UserUncheckedCreateWithoutHackerInput> = z.object({
  id: z.string().cuid().optional(),
  name: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  emailVerified: z.coerce.date().optional().nullable(),
  image: z.string().optional().nullable(),
  typeform_response_id: z.string().optional().nullable(),
  role: z.union([ z.lazy(() => UserCreateroleInputSchema),z.lazy(() => RoleSchema).array() ]).optional(),
  status: z.lazy(() => StatusSchema).optional(),
  qrcode: z.number().int().optional().nullable(),
  mealsTaken: z.number().int().optional(),
  lastMealTaken: z.coerce.date().optional().nullable(),
  dH10ApplicationId: z.string().optional().nullable(),
  accounts: z.lazy(() => AccountUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  sessions: z.lazy(() => SessionUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  reviewer: z.lazy(() => ReviewUncheckedCreateNestedManyWithoutReviewerInputSchema).optional(),
  EventLog: z.lazy(() => EventLogUncheckedCreateNestedManyWithoutUserInputSchema).optional()
}).strict();

export const UserCreateOrConnectWithoutHackerInputSchema: z.ZodType<Prisma.UserCreateOrConnectWithoutHackerInput> = z.object({
  where: z.lazy(() => UserWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserCreateWithoutHackerInputSchema),z.lazy(() => UserUncheckedCreateWithoutHackerInputSchema) ]),
}).strict();

export const UserCreateWithoutReviewerInputSchema: z.ZodType<Prisma.UserCreateWithoutReviewerInput> = z.object({
  id: z.string().cuid().optional(),
  name: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  emailVerified: z.coerce.date().optional().nullable(),
  image: z.string().optional().nullable(),
  typeform_response_id: z.string().optional().nullable(),
  role: z.union([ z.lazy(() => UserCreateroleInputSchema),z.lazy(() => RoleSchema).array() ]).optional(),
  status: z.lazy(() => StatusSchema).optional(),
  qrcode: z.number().int().optional().nullable(),
  mealsTaken: z.number().int().optional(),
  lastMealTaken: z.coerce.date().optional().nullable(),
  accounts: z.lazy(() => AccountCreateNestedManyWithoutUserInputSchema).optional(),
  sessions: z.lazy(() => SessionCreateNestedManyWithoutUserInputSchema).optional(),
  hacker: z.lazy(() => ReviewCreateNestedManyWithoutHackerInputSchema).optional(),
  EventLog: z.lazy(() => EventLogCreateNestedManyWithoutUserInputSchema).optional(),
  dh10application: z.lazy(() => DH10ApplicationCreateNestedOneWithoutUserInputSchema).optional()
}).strict();

export const UserUncheckedCreateWithoutReviewerInputSchema: z.ZodType<Prisma.UserUncheckedCreateWithoutReviewerInput> = z.object({
  id: z.string().cuid().optional(),
  name: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  emailVerified: z.coerce.date().optional().nullable(),
  image: z.string().optional().nullable(),
  typeform_response_id: z.string().optional().nullable(),
  role: z.union([ z.lazy(() => UserCreateroleInputSchema),z.lazy(() => RoleSchema).array() ]).optional(),
  status: z.lazy(() => StatusSchema).optional(),
  qrcode: z.number().int().optional().nullable(),
  mealsTaken: z.number().int().optional(),
  lastMealTaken: z.coerce.date().optional().nullable(),
  dH10ApplicationId: z.string().optional().nullable(),
  accounts: z.lazy(() => AccountUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  sessions: z.lazy(() => SessionUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  hacker: z.lazy(() => ReviewUncheckedCreateNestedManyWithoutHackerInputSchema).optional(),
  EventLog: z.lazy(() => EventLogUncheckedCreateNestedManyWithoutUserInputSchema).optional()
}).strict();

export const UserCreateOrConnectWithoutReviewerInputSchema: z.ZodType<Prisma.UserCreateOrConnectWithoutReviewerInput> = z.object({
  where: z.lazy(() => UserWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserCreateWithoutReviewerInputSchema),z.lazy(() => UserUncheckedCreateWithoutReviewerInputSchema) ]),
}).strict();

export const UserUpsertWithoutHackerInputSchema: z.ZodType<Prisma.UserUpsertWithoutHackerInput> = z.object({
  update: z.union([ z.lazy(() => UserUpdateWithoutHackerInputSchema),z.lazy(() => UserUncheckedUpdateWithoutHackerInputSchema) ]),
  create: z.union([ z.lazy(() => UserCreateWithoutHackerInputSchema),z.lazy(() => UserUncheckedCreateWithoutHackerInputSchema) ]),
  where: z.lazy(() => UserWhereInputSchema).optional()
}).strict();

export const UserUpdateToOneWithWhereWithoutHackerInputSchema: z.ZodType<Prisma.UserUpdateToOneWithWhereWithoutHackerInput> = z.object({
  where: z.lazy(() => UserWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => UserUpdateWithoutHackerInputSchema),z.lazy(() => UserUncheckedUpdateWithoutHackerInputSchema) ]),
}).strict();

export const UserUpdateWithoutHackerInputSchema: z.ZodType<Prisma.UserUpdateWithoutHackerInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  email: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  emailVerified: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  image: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  typeform_response_id: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  role: z.union([ z.lazy(() => UserUpdateroleInputSchema),z.lazy(() => RoleSchema).array() ]).optional(),
  status: z.union([ z.lazy(() => StatusSchema),z.lazy(() => EnumStatusFieldUpdateOperationsInputSchema) ]).optional(),
  qrcode: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  mealsTaken: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  lastMealTaken: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  accounts: z.lazy(() => AccountUpdateManyWithoutUserNestedInputSchema).optional(),
  sessions: z.lazy(() => SessionUpdateManyWithoutUserNestedInputSchema).optional(),
  reviewer: z.lazy(() => ReviewUpdateManyWithoutReviewerNestedInputSchema).optional(),
  EventLog: z.lazy(() => EventLogUpdateManyWithoutUserNestedInputSchema).optional(),
  dh10application: z.lazy(() => DH10ApplicationUpdateOneWithoutUserNestedInputSchema).optional()
}).strict();

export const UserUncheckedUpdateWithoutHackerInputSchema: z.ZodType<Prisma.UserUncheckedUpdateWithoutHackerInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  email: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  emailVerified: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  image: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  typeform_response_id: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  role: z.union([ z.lazy(() => UserUpdateroleInputSchema),z.lazy(() => RoleSchema).array() ]).optional(),
  status: z.union([ z.lazy(() => StatusSchema),z.lazy(() => EnumStatusFieldUpdateOperationsInputSchema) ]).optional(),
  qrcode: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  mealsTaken: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  lastMealTaken: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  dH10ApplicationId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  accounts: z.lazy(() => AccountUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  sessions: z.lazy(() => SessionUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  reviewer: z.lazy(() => ReviewUncheckedUpdateManyWithoutReviewerNestedInputSchema).optional(),
  EventLog: z.lazy(() => EventLogUncheckedUpdateManyWithoutUserNestedInputSchema).optional()
}).strict();

export const UserUpsertWithoutReviewerInputSchema: z.ZodType<Prisma.UserUpsertWithoutReviewerInput> = z.object({
  update: z.union([ z.lazy(() => UserUpdateWithoutReviewerInputSchema),z.lazy(() => UserUncheckedUpdateWithoutReviewerInputSchema) ]),
  create: z.union([ z.lazy(() => UserCreateWithoutReviewerInputSchema),z.lazy(() => UserUncheckedCreateWithoutReviewerInputSchema) ]),
  where: z.lazy(() => UserWhereInputSchema).optional()
}).strict();

export const UserUpdateToOneWithWhereWithoutReviewerInputSchema: z.ZodType<Prisma.UserUpdateToOneWithWhereWithoutReviewerInput> = z.object({
  where: z.lazy(() => UserWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => UserUpdateWithoutReviewerInputSchema),z.lazy(() => UserUncheckedUpdateWithoutReviewerInputSchema) ]),
}).strict();

export const UserUpdateWithoutReviewerInputSchema: z.ZodType<Prisma.UserUpdateWithoutReviewerInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  email: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  emailVerified: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  image: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  typeform_response_id: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  role: z.union([ z.lazy(() => UserUpdateroleInputSchema),z.lazy(() => RoleSchema).array() ]).optional(),
  status: z.union([ z.lazy(() => StatusSchema),z.lazy(() => EnumStatusFieldUpdateOperationsInputSchema) ]).optional(),
  qrcode: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  mealsTaken: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  lastMealTaken: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  accounts: z.lazy(() => AccountUpdateManyWithoutUserNestedInputSchema).optional(),
  sessions: z.lazy(() => SessionUpdateManyWithoutUserNestedInputSchema).optional(),
  hacker: z.lazy(() => ReviewUpdateManyWithoutHackerNestedInputSchema).optional(),
  EventLog: z.lazy(() => EventLogUpdateManyWithoutUserNestedInputSchema).optional(),
  dh10application: z.lazy(() => DH10ApplicationUpdateOneWithoutUserNestedInputSchema).optional()
}).strict();

export const UserUncheckedUpdateWithoutReviewerInputSchema: z.ZodType<Prisma.UserUncheckedUpdateWithoutReviewerInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  email: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  emailVerified: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  image: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  typeform_response_id: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  role: z.union([ z.lazy(() => UserUpdateroleInputSchema),z.lazy(() => RoleSchema).array() ]).optional(),
  status: z.union([ z.lazy(() => StatusSchema),z.lazy(() => EnumStatusFieldUpdateOperationsInputSchema) ]).optional(),
  qrcode: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  mealsTaken: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  lastMealTaken: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  dH10ApplicationId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  accounts: z.lazy(() => AccountUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  sessions: z.lazy(() => SessionUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  hacker: z.lazy(() => ReviewUncheckedUpdateManyWithoutHackerNestedInputSchema).optional(),
  EventLog: z.lazy(() => EventLogUncheckedUpdateManyWithoutUserNestedInputSchema).optional()
}).strict();

export const UserCreateWithoutEventLogInputSchema: z.ZodType<Prisma.UserCreateWithoutEventLogInput> = z.object({
  id: z.string().cuid().optional(),
  name: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  emailVerified: z.coerce.date().optional().nullable(),
  image: z.string().optional().nullable(),
  typeform_response_id: z.string().optional().nullable(),
  role: z.union([ z.lazy(() => UserCreateroleInputSchema),z.lazy(() => RoleSchema).array() ]).optional(),
  status: z.lazy(() => StatusSchema).optional(),
  qrcode: z.number().int().optional().nullable(),
  mealsTaken: z.number().int().optional(),
  lastMealTaken: z.coerce.date().optional().nullable(),
  accounts: z.lazy(() => AccountCreateNestedManyWithoutUserInputSchema).optional(),
  sessions: z.lazy(() => SessionCreateNestedManyWithoutUserInputSchema).optional(),
  hacker: z.lazy(() => ReviewCreateNestedManyWithoutHackerInputSchema).optional(),
  reviewer: z.lazy(() => ReviewCreateNestedManyWithoutReviewerInputSchema).optional(),
  dh10application: z.lazy(() => DH10ApplicationCreateNestedOneWithoutUserInputSchema).optional()
}).strict();

export const UserUncheckedCreateWithoutEventLogInputSchema: z.ZodType<Prisma.UserUncheckedCreateWithoutEventLogInput> = z.object({
  id: z.string().cuid().optional(),
  name: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  emailVerified: z.coerce.date().optional().nullable(),
  image: z.string().optional().nullable(),
  typeform_response_id: z.string().optional().nullable(),
  role: z.union([ z.lazy(() => UserCreateroleInputSchema),z.lazy(() => RoleSchema).array() ]).optional(),
  status: z.lazy(() => StatusSchema).optional(),
  qrcode: z.number().int().optional().nullable(),
  mealsTaken: z.number().int().optional(),
  lastMealTaken: z.coerce.date().optional().nullable(),
  dH10ApplicationId: z.string().optional().nullable(),
  accounts: z.lazy(() => AccountUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  sessions: z.lazy(() => SessionUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  hacker: z.lazy(() => ReviewUncheckedCreateNestedManyWithoutHackerInputSchema).optional(),
  reviewer: z.lazy(() => ReviewUncheckedCreateNestedManyWithoutReviewerInputSchema).optional()
}).strict();

export const UserCreateOrConnectWithoutEventLogInputSchema: z.ZodType<Prisma.UserCreateOrConnectWithoutEventLogInput> = z.object({
  where: z.lazy(() => UserWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserCreateWithoutEventLogInputSchema),z.lazy(() => UserUncheckedCreateWithoutEventLogInputSchema) ]),
}).strict();

export const UserUpsertWithoutEventLogInputSchema: z.ZodType<Prisma.UserUpsertWithoutEventLogInput> = z.object({
  update: z.union([ z.lazy(() => UserUpdateWithoutEventLogInputSchema),z.lazy(() => UserUncheckedUpdateWithoutEventLogInputSchema) ]),
  create: z.union([ z.lazy(() => UserCreateWithoutEventLogInputSchema),z.lazy(() => UserUncheckedCreateWithoutEventLogInputSchema) ]),
  where: z.lazy(() => UserWhereInputSchema).optional()
}).strict();

export const UserUpdateToOneWithWhereWithoutEventLogInputSchema: z.ZodType<Prisma.UserUpdateToOneWithWhereWithoutEventLogInput> = z.object({
  where: z.lazy(() => UserWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => UserUpdateWithoutEventLogInputSchema),z.lazy(() => UserUncheckedUpdateWithoutEventLogInputSchema) ]),
}).strict();

export const UserUpdateWithoutEventLogInputSchema: z.ZodType<Prisma.UserUpdateWithoutEventLogInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  email: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  emailVerified: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  image: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  typeform_response_id: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  role: z.union([ z.lazy(() => UserUpdateroleInputSchema),z.lazy(() => RoleSchema).array() ]).optional(),
  status: z.union([ z.lazy(() => StatusSchema),z.lazy(() => EnumStatusFieldUpdateOperationsInputSchema) ]).optional(),
  qrcode: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  mealsTaken: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  lastMealTaken: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  accounts: z.lazy(() => AccountUpdateManyWithoutUserNestedInputSchema).optional(),
  sessions: z.lazy(() => SessionUpdateManyWithoutUserNestedInputSchema).optional(),
  hacker: z.lazy(() => ReviewUpdateManyWithoutHackerNestedInputSchema).optional(),
  reviewer: z.lazy(() => ReviewUpdateManyWithoutReviewerNestedInputSchema).optional(),
  dh10application: z.lazy(() => DH10ApplicationUpdateOneWithoutUserNestedInputSchema).optional()
}).strict();

export const UserUncheckedUpdateWithoutEventLogInputSchema: z.ZodType<Prisma.UserUncheckedUpdateWithoutEventLogInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  email: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  emailVerified: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  image: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  typeform_response_id: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  role: z.union([ z.lazy(() => UserUpdateroleInputSchema),z.lazy(() => RoleSchema).array() ]).optional(),
  status: z.union([ z.lazy(() => StatusSchema),z.lazy(() => EnumStatusFieldUpdateOperationsInputSchema) ]).optional(),
  qrcode: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  mealsTaken: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  lastMealTaken: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  dH10ApplicationId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  accounts: z.lazy(() => AccountUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  sessions: z.lazy(() => SessionUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  hacker: z.lazy(() => ReviewUncheckedUpdateManyWithoutHackerNestedInputSchema).optional(),
  reviewer: z.lazy(() => ReviewUncheckedUpdateManyWithoutReviewerNestedInputSchema).optional()
}).strict();

export const UserCreateWithoutDh10applicationInputSchema: z.ZodType<Prisma.UserCreateWithoutDh10applicationInput> = z.object({
  id: z.string().cuid().optional(),
  name: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  emailVerified: z.coerce.date().optional().nullable(),
  image: z.string().optional().nullable(),
  typeform_response_id: z.string().optional().nullable(),
  role: z.union([ z.lazy(() => UserCreateroleInputSchema),z.lazy(() => RoleSchema).array() ]).optional(),
  status: z.lazy(() => StatusSchema).optional(),
  qrcode: z.number().int().optional().nullable(),
  mealsTaken: z.number().int().optional(),
  lastMealTaken: z.coerce.date().optional().nullable(),
  accounts: z.lazy(() => AccountCreateNestedManyWithoutUserInputSchema).optional(),
  sessions: z.lazy(() => SessionCreateNestedManyWithoutUserInputSchema).optional(),
  hacker: z.lazy(() => ReviewCreateNestedManyWithoutHackerInputSchema).optional(),
  reviewer: z.lazy(() => ReviewCreateNestedManyWithoutReviewerInputSchema).optional(),
  EventLog: z.lazy(() => EventLogCreateNestedManyWithoutUserInputSchema).optional()
}).strict();

export const UserUncheckedCreateWithoutDh10applicationInputSchema: z.ZodType<Prisma.UserUncheckedCreateWithoutDh10applicationInput> = z.object({
  id: z.string().cuid().optional(),
  name: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  emailVerified: z.coerce.date().optional().nullable(),
  image: z.string().optional().nullable(),
  typeform_response_id: z.string().optional().nullable(),
  role: z.union([ z.lazy(() => UserCreateroleInputSchema),z.lazy(() => RoleSchema).array() ]).optional(),
  status: z.lazy(() => StatusSchema).optional(),
  qrcode: z.number().int().optional().nullable(),
  mealsTaken: z.number().int().optional(),
  lastMealTaken: z.coerce.date().optional().nullable(),
  accounts: z.lazy(() => AccountUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  sessions: z.lazy(() => SessionUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  hacker: z.lazy(() => ReviewUncheckedCreateNestedManyWithoutHackerInputSchema).optional(),
  reviewer: z.lazy(() => ReviewUncheckedCreateNestedManyWithoutReviewerInputSchema).optional(),
  EventLog: z.lazy(() => EventLogUncheckedCreateNestedManyWithoutUserInputSchema).optional()
}).strict();

export const UserCreateOrConnectWithoutDh10applicationInputSchema: z.ZodType<Prisma.UserCreateOrConnectWithoutDh10applicationInput> = z.object({
  where: z.lazy(() => UserWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserCreateWithoutDh10applicationInputSchema),z.lazy(() => UserUncheckedCreateWithoutDh10applicationInputSchema) ]),
}).strict();

export const UserUpsertWithoutDh10applicationInputSchema: z.ZodType<Prisma.UserUpsertWithoutDh10applicationInput> = z.object({
  update: z.union([ z.lazy(() => UserUpdateWithoutDh10applicationInputSchema),z.lazy(() => UserUncheckedUpdateWithoutDh10applicationInputSchema) ]),
  create: z.union([ z.lazy(() => UserCreateWithoutDh10applicationInputSchema),z.lazy(() => UserUncheckedCreateWithoutDh10applicationInputSchema) ]),
  where: z.lazy(() => UserWhereInputSchema).optional()
}).strict();

export const UserUpdateToOneWithWhereWithoutDh10applicationInputSchema: z.ZodType<Prisma.UserUpdateToOneWithWhereWithoutDh10applicationInput> = z.object({
  where: z.lazy(() => UserWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => UserUpdateWithoutDh10applicationInputSchema),z.lazy(() => UserUncheckedUpdateWithoutDh10applicationInputSchema) ]),
}).strict();

export const UserUpdateWithoutDh10applicationInputSchema: z.ZodType<Prisma.UserUpdateWithoutDh10applicationInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  email: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  emailVerified: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  image: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  typeform_response_id: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  role: z.union([ z.lazy(() => UserUpdateroleInputSchema),z.lazy(() => RoleSchema).array() ]).optional(),
  status: z.union([ z.lazy(() => StatusSchema),z.lazy(() => EnumStatusFieldUpdateOperationsInputSchema) ]).optional(),
  qrcode: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  mealsTaken: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  lastMealTaken: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  accounts: z.lazy(() => AccountUpdateManyWithoutUserNestedInputSchema).optional(),
  sessions: z.lazy(() => SessionUpdateManyWithoutUserNestedInputSchema).optional(),
  hacker: z.lazy(() => ReviewUpdateManyWithoutHackerNestedInputSchema).optional(),
  reviewer: z.lazy(() => ReviewUpdateManyWithoutReviewerNestedInputSchema).optional(),
  EventLog: z.lazy(() => EventLogUpdateManyWithoutUserNestedInputSchema).optional()
}).strict();

export const UserUncheckedUpdateWithoutDh10applicationInputSchema: z.ZodType<Prisma.UserUncheckedUpdateWithoutDh10applicationInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  email: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  emailVerified: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  image: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  typeform_response_id: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  role: z.union([ z.lazy(() => UserUpdateroleInputSchema),z.lazy(() => RoleSchema).array() ]).optional(),
  status: z.union([ z.lazy(() => StatusSchema),z.lazy(() => EnumStatusFieldUpdateOperationsInputSchema) ]).optional(),
  qrcode: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  mealsTaken: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  lastMealTaken: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  accounts: z.lazy(() => AccountUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  sessions: z.lazy(() => SessionUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  hacker: z.lazy(() => ReviewUncheckedUpdateManyWithoutHackerNestedInputSchema).optional(),
  reviewer: z.lazy(() => ReviewUncheckedUpdateManyWithoutReviewerNestedInputSchema).optional(),
  EventLog: z.lazy(() => EventLogUncheckedUpdateManyWithoutUserNestedInputSchema).optional()
}).strict();

export const AccountCreateManyUserInputSchema: z.ZodType<Prisma.AccountCreateManyUserInput> = z.object({
  id: z.string().cuid().optional(),
  type: z.string(),
  provider: z.string(),
  providerAccountId: z.string(),
  refresh_token: z.string().optional().nullable(),
  refresh_token_expires_in: z.number().int().optional().nullable(),
  access_token: z.string().optional().nullable(),
  expires_at: z.number().int().optional().nullable(),
  ext_expires_in: z.number().int().optional().nullable(),
  oauth_token_secret: z.string().optional().nullable(),
  oauth_token: z.string().optional().nullable(),
  token_type: z.string().optional().nullable(),
  scope: z.string().optional().nullable(),
  id_token: z.string().optional().nullable(),
  session_state: z.string().optional().nullable()
}).strict();

export const SessionCreateManyUserInputSchema: z.ZodType<Prisma.SessionCreateManyUserInput> = z.object({
  id: z.string().cuid().optional(),
  sessionToken: z.string(),
  expires: z.coerce.date()
}).strict();

export const ReviewCreateManyHackerInputSchema: z.ZodType<Prisma.ReviewCreateManyHackerInput> = z.object({
  id: z.string().cuid().optional(),
  reviewerId: z.string(),
  mark: z.number().optional()
}).strict();

export const ReviewCreateManyReviewerInputSchema: z.ZodType<Prisma.ReviewCreateManyReviewerInput> = z.object({
  id: z.string().cuid().optional(),
  hackerId: z.string(),
  mark: z.number().optional()
}).strict();

export const EventLogCreateManyUserInputSchema: z.ZodType<Prisma.EventLogCreateManyUserInput> = z.object({
  id: z.string().cuid().optional(),
  timestamp: z.coerce.date().optional(),
  event: z.string()
}).strict();

export const AccountUpdateWithoutUserInputSchema: z.ZodType<Prisma.AccountUpdateWithoutUserInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  provider: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  providerAccountId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  refresh_token: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  refresh_token_expires_in: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  access_token: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  expires_at: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  ext_expires_in: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  oauth_token_secret: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  oauth_token: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  token_type: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  scope: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  id_token: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  session_state: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
}).strict();

export const AccountUncheckedUpdateWithoutUserInputSchema: z.ZodType<Prisma.AccountUncheckedUpdateWithoutUserInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  provider: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  providerAccountId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  refresh_token: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  refresh_token_expires_in: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  access_token: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  expires_at: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  ext_expires_in: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  oauth_token_secret: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  oauth_token: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  token_type: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  scope: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  id_token: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  session_state: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
}).strict();

export const AccountUncheckedUpdateManyWithoutUserInputSchema: z.ZodType<Prisma.AccountUncheckedUpdateManyWithoutUserInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  provider: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  providerAccountId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  refresh_token: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  refresh_token_expires_in: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  access_token: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  expires_at: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  ext_expires_in: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  oauth_token_secret: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  oauth_token: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  token_type: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  scope: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  id_token: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  session_state: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
}).strict();

export const SessionUpdateWithoutUserInputSchema: z.ZodType<Prisma.SessionUpdateWithoutUserInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  sessionToken: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  expires: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const SessionUncheckedUpdateWithoutUserInputSchema: z.ZodType<Prisma.SessionUncheckedUpdateWithoutUserInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  sessionToken: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  expires: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const SessionUncheckedUpdateManyWithoutUserInputSchema: z.ZodType<Prisma.SessionUncheckedUpdateManyWithoutUserInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  sessionToken: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  expires: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const ReviewUpdateWithoutHackerInputSchema: z.ZodType<Prisma.ReviewUpdateWithoutHackerInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  mark: z.union([ z.number(),z.lazy(() => FloatFieldUpdateOperationsInputSchema) ]).optional(),
  reviewer: z.lazy(() => UserUpdateOneRequiredWithoutReviewerNestedInputSchema).optional()
}).strict();

export const ReviewUncheckedUpdateWithoutHackerInputSchema: z.ZodType<Prisma.ReviewUncheckedUpdateWithoutHackerInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  reviewerId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  mark: z.union([ z.number(),z.lazy(() => FloatFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const ReviewUncheckedUpdateManyWithoutHackerInputSchema: z.ZodType<Prisma.ReviewUncheckedUpdateManyWithoutHackerInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  reviewerId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  mark: z.union([ z.number(),z.lazy(() => FloatFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const ReviewUpdateWithoutReviewerInputSchema: z.ZodType<Prisma.ReviewUpdateWithoutReviewerInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  mark: z.union([ z.number(),z.lazy(() => FloatFieldUpdateOperationsInputSchema) ]).optional(),
  hacker: z.lazy(() => UserUpdateOneRequiredWithoutHackerNestedInputSchema).optional()
}).strict();

export const ReviewUncheckedUpdateWithoutReviewerInputSchema: z.ZodType<Prisma.ReviewUncheckedUpdateWithoutReviewerInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  hackerId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  mark: z.union([ z.number(),z.lazy(() => FloatFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const ReviewUncheckedUpdateManyWithoutReviewerInputSchema: z.ZodType<Prisma.ReviewUncheckedUpdateManyWithoutReviewerInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  hackerId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  mark: z.union([ z.number(),z.lazy(() => FloatFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const EventLogUpdateWithoutUserInputSchema: z.ZodType<Prisma.EventLogUpdateWithoutUserInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  timestamp: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  event: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const EventLogUncheckedUpdateWithoutUserInputSchema: z.ZodType<Prisma.EventLogUncheckedUpdateWithoutUserInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  timestamp: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  event: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const EventLogUncheckedUpdateManyWithoutUserInputSchema: z.ZodType<Prisma.EventLogUncheckedUpdateManyWithoutUserInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  timestamp: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  event: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

/////////////////////////////////////////
// ARGS
/////////////////////////////////////////

export const AccountFindFirstArgsSchema: z.ZodType<Prisma.AccountFindFirstArgs> = z.object({
  select: AccountSelectSchema.optional(),
  include: AccountIncludeSchema.optional(),
  where: AccountWhereInputSchema.optional(),
  orderBy: z.union([ AccountOrderByWithRelationInputSchema.array(),AccountOrderByWithRelationInputSchema ]).optional(),
  cursor: AccountWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ AccountScalarFieldEnumSchema,AccountScalarFieldEnumSchema.array() ]).optional(),
}).strict()

export const AccountFindFirstOrThrowArgsSchema: z.ZodType<Prisma.AccountFindFirstOrThrowArgs> = z.object({
  select: AccountSelectSchema.optional(),
  include: AccountIncludeSchema.optional(),
  where: AccountWhereInputSchema.optional(),
  orderBy: z.union([ AccountOrderByWithRelationInputSchema.array(),AccountOrderByWithRelationInputSchema ]).optional(),
  cursor: AccountWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ AccountScalarFieldEnumSchema,AccountScalarFieldEnumSchema.array() ]).optional(),
}).strict()

export const AccountFindManyArgsSchema: z.ZodType<Prisma.AccountFindManyArgs> = z.object({
  select: AccountSelectSchema.optional(),
  include: AccountIncludeSchema.optional(),
  where: AccountWhereInputSchema.optional(),
  orderBy: z.union([ AccountOrderByWithRelationInputSchema.array(),AccountOrderByWithRelationInputSchema ]).optional(),
  cursor: AccountWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ AccountScalarFieldEnumSchema,AccountScalarFieldEnumSchema.array() ]).optional(),
}).strict()

export const AccountAggregateArgsSchema: z.ZodType<Prisma.AccountAggregateArgs> = z.object({
  where: AccountWhereInputSchema.optional(),
  orderBy: z.union([ AccountOrderByWithRelationInputSchema.array(),AccountOrderByWithRelationInputSchema ]).optional(),
  cursor: AccountWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict()

export const AccountGroupByArgsSchema: z.ZodType<Prisma.AccountGroupByArgs> = z.object({
  where: AccountWhereInputSchema.optional(),
  orderBy: z.union([ AccountOrderByWithAggregationInputSchema.array(),AccountOrderByWithAggregationInputSchema ]).optional(),
  by: AccountScalarFieldEnumSchema.array(),
  having: AccountScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict()

export const AccountFindUniqueArgsSchema: z.ZodType<Prisma.AccountFindUniqueArgs> = z.object({
  select: AccountSelectSchema.optional(),
  include: AccountIncludeSchema.optional(),
  where: AccountWhereUniqueInputSchema,
}).strict()

export const AccountFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.AccountFindUniqueOrThrowArgs> = z.object({
  select: AccountSelectSchema.optional(),
  include: AccountIncludeSchema.optional(),
  where: AccountWhereUniqueInputSchema,
}).strict()

export const SessionFindFirstArgsSchema: z.ZodType<Prisma.SessionFindFirstArgs> = z.object({
  select: SessionSelectSchema.optional(),
  include: SessionIncludeSchema.optional(),
  where: SessionWhereInputSchema.optional(),
  orderBy: z.union([ SessionOrderByWithRelationInputSchema.array(),SessionOrderByWithRelationInputSchema ]).optional(),
  cursor: SessionWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ SessionScalarFieldEnumSchema,SessionScalarFieldEnumSchema.array() ]).optional(),
}).strict()

export const SessionFindFirstOrThrowArgsSchema: z.ZodType<Prisma.SessionFindFirstOrThrowArgs> = z.object({
  select: SessionSelectSchema.optional(),
  include: SessionIncludeSchema.optional(),
  where: SessionWhereInputSchema.optional(),
  orderBy: z.union([ SessionOrderByWithRelationInputSchema.array(),SessionOrderByWithRelationInputSchema ]).optional(),
  cursor: SessionWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ SessionScalarFieldEnumSchema,SessionScalarFieldEnumSchema.array() ]).optional(),
}).strict()

export const SessionFindManyArgsSchema: z.ZodType<Prisma.SessionFindManyArgs> = z.object({
  select: SessionSelectSchema.optional(),
  include: SessionIncludeSchema.optional(),
  where: SessionWhereInputSchema.optional(),
  orderBy: z.union([ SessionOrderByWithRelationInputSchema.array(),SessionOrderByWithRelationInputSchema ]).optional(),
  cursor: SessionWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ SessionScalarFieldEnumSchema,SessionScalarFieldEnumSchema.array() ]).optional(),
}).strict()

export const SessionAggregateArgsSchema: z.ZodType<Prisma.SessionAggregateArgs> = z.object({
  where: SessionWhereInputSchema.optional(),
  orderBy: z.union([ SessionOrderByWithRelationInputSchema.array(),SessionOrderByWithRelationInputSchema ]).optional(),
  cursor: SessionWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict()

export const SessionGroupByArgsSchema: z.ZodType<Prisma.SessionGroupByArgs> = z.object({
  where: SessionWhereInputSchema.optional(),
  orderBy: z.union([ SessionOrderByWithAggregationInputSchema.array(),SessionOrderByWithAggregationInputSchema ]).optional(),
  by: SessionScalarFieldEnumSchema.array(),
  having: SessionScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict()

export const SessionFindUniqueArgsSchema: z.ZodType<Prisma.SessionFindUniqueArgs> = z.object({
  select: SessionSelectSchema.optional(),
  include: SessionIncludeSchema.optional(),
  where: SessionWhereUniqueInputSchema,
}).strict()

export const SessionFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.SessionFindUniqueOrThrowArgs> = z.object({
  select: SessionSelectSchema.optional(),
  include: SessionIncludeSchema.optional(),
  where: SessionWhereUniqueInputSchema,
}).strict()

export const UserFindFirstArgsSchema: z.ZodType<Prisma.UserFindFirstArgs> = z.object({
  select: UserSelectSchema.optional(),
  include: UserIncludeSchema.optional(),
  where: UserWhereInputSchema.optional(),
  orderBy: z.union([ UserOrderByWithRelationInputSchema.array(),UserOrderByWithRelationInputSchema ]).optional(),
  cursor: UserWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ UserScalarFieldEnumSchema,UserScalarFieldEnumSchema.array() ]).optional(),
}).strict()

export const UserFindFirstOrThrowArgsSchema: z.ZodType<Prisma.UserFindFirstOrThrowArgs> = z.object({
  select: UserSelectSchema.optional(),
  include: UserIncludeSchema.optional(),
  where: UserWhereInputSchema.optional(),
  orderBy: z.union([ UserOrderByWithRelationInputSchema.array(),UserOrderByWithRelationInputSchema ]).optional(),
  cursor: UserWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ UserScalarFieldEnumSchema,UserScalarFieldEnumSchema.array() ]).optional(),
}).strict()

export const UserFindManyArgsSchema: z.ZodType<Prisma.UserFindManyArgs> = z.object({
  select: UserSelectSchema.optional(),
  include: UserIncludeSchema.optional(),
  where: UserWhereInputSchema.optional(),
  orderBy: z.union([ UserOrderByWithRelationInputSchema.array(),UserOrderByWithRelationInputSchema ]).optional(),
  cursor: UserWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ UserScalarFieldEnumSchema,UserScalarFieldEnumSchema.array() ]).optional(),
}).strict()

export const UserAggregateArgsSchema: z.ZodType<Prisma.UserAggregateArgs> = z.object({
  where: UserWhereInputSchema.optional(),
  orderBy: z.union([ UserOrderByWithRelationInputSchema.array(),UserOrderByWithRelationInputSchema ]).optional(),
  cursor: UserWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict()

export const UserGroupByArgsSchema: z.ZodType<Prisma.UserGroupByArgs> = z.object({
  where: UserWhereInputSchema.optional(),
  orderBy: z.union([ UserOrderByWithAggregationInputSchema.array(),UserOrderByWithAggregationInputSchema ]).optional(),
  by: UserScalarFieldEnumSchema.array(),
  having: UserScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict()

export const UserFindUniqueArgsSchema: z.ZodType<Prisma.UserFindUniqueArgs> = z.object({
  select: UserSelectSchema.optional(),
  include: UserIncludeSchema.optional(),
  where: UserWhereUniqueInputSchema,
}).strict()

export const UserFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.UserFindUniqueOrThrowArgs> = z.object({
  select: UserSelectSchema.optional(),
  include: UserIncludeSchema.optional(),
  where: UserWhereUniqueInputSchema,
}).strict()

export const ReviewFindFirstArgsSchema: z.ZodType<Prisma.ReviewFindFirstArgs> = z.object({
  select: ReviewSelectSchema.optional(),
  include: ReviewIncludeSchema.optional(),
  where: ReviewWhereInputSchema.optional(),
  orderBy: z.union([ ReviewOrderByWithRelationInputSchema.array(),ReviewOrderByWithRelationInputSchema ]).optional(),
  cursor: ReviewWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ ReviewScalarFieldEnumSchema,ReviewScalarFieldEnumSchema.array() ]).optional(),
}).strict()

export const ReviewFindFirstOrThrowArgsSchema: z.ZodType<Prisma.ReviewFindFirstOrThrowArgs> = z.object({
  select: ReviewSelectSchema.optional(),
  include: ReviewIncludeSchema.optional(),
  where: ReviewWhereInputSchema.optional(),
  orderBy: z.union([ ReviewOrderByWithRelationInputSchema.array(),ReviewOrderByWithRelationInputSchema ]).optional(),
  cursor: ReviewWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ ReviewScalarFieldEnumSchema,ReviewScalarFieldEnumSchema.array() ]).optional(),
}).strict()

export const ReviewFindManyArgsSchema: z.ZodType<Prisma.ReviewFindManyArgs> = z.object({
  select: ReviewSelectSchema.optional(),
  include: ReviewIncludeSchema.optional(),
  where: ReviewWhereInputSchema.optional(),
  orderBy: z.union([ ReviewOrderByWithRelationInputSchema.array(),ReviewOrderByWithRelationInputSchema ]).optional(),
  cursor: ReviewWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ ReviewScalarFieldEnumSchema,ReviewScalarFieldEnumSchema.array() ]).optional(),
}).strict()

export const ReviewAggregateArgsSchema: z.ZodType<Prisma.ReviewAggregateArgs> = z.object({
  where: ReviewWhereInputSchema.optional(),
  orderBy: z.union([ ReviewOrderByWithRelationInputSchema.array(),ReviewOrderByWithRelationInputSchema ]).optional(),
  cursor: ReviewWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict()

export const ReviewGroupByArgsSchema: z.ZodType<Prisma.ReviewGroupByArgs> = z.object({
  where: ReviewWhereInputSchema.optional(),
  orderBy: z.union([ ReviewOrderByWithAggregationInputSchema.array(),ReviewOrderByWithAggregationInputSchema ]).optional(),
  by: ReviewScalarFieldEnumSchema.array(),
  having: ReviewScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict()

export const ReviewFindUniqueArgsSchema: z.ZodType<Prisma.ReviewFindUniqueArgs> = z.object({
  select: ReviewSelectSchema.optional(),
  include: ReviewIncludeSchema.optional(),
  where: ReviewWhereUniqueInputSchema,
}).strict()

export const ReviewFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.ReviewFindUniqueOrThrowArgs> = z.object({
  select: ReviewSelectSchema.optional(),
  include: ReviewIncludeSchema.optional(),
  where: ReviewWhereUniqueInputSchema,
}).strict()

export const EventLogFindFirstArgsSchema: z.ZodType<Prisma.EventLogFindFirstArgs> = z.object({
  select: EventLogSelectSchema.optional(),
  include: EventLogIncludeSchema.optional(),
  where: EventLogWhereInputSchema.optional(),
  orderBy: z.union([ EventLogOrderByWithRelationInputSchema.array(),EventLogOrderByWithRelationInputSchema ]).optional(),
  cursor: EventLogWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ EventLogScalarFieldEnumSchema,EventLogScalarFieldEnumSchema.array() ]).optional(),
}).strict()

export const EventLogFindFirstOrThrowArgsSchema: z.ZodType<Prisma.EventLogFindFirstOrThrowArgs> = z.object({
  select: EventLogSelectSchema.optional(),
  include: EventLogIncludeSchema.optional(),
  where: EventLogWhereInputSchema.optional(),
  orderBy: z.union([ EventLogOrderByWithRelationInputSchema.array(),EventLogOrderByWithRelationInputSchema ]).optional(),
  cursor: EventLogWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ EventLogScalarFieldEnumSchema,EventLogScalarFieldEnumSchema.array() ]).optional(),
}).strict()

export const EventLogFindManyArgsSchema: z.ZodType<Prisma.EventLogFindManyArgs> = z.object({
  select: EventLogSelectSchema.optional(),
  include: EventLogIncludeSchema.optional(),
  where: EventLogWhereInputSchema.optional(),
  orderBy: z.union([ EventLogOrderByWithRelationInputSchema.array(),EventLogOrderByWithRelationInputSchema ]).optional(),
  cursor: EventLogWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ EventLogScalarFieldEnumSchema,EventLogScalarFieldEnumSchema.array() ]).optional(),
}).strict()

export const EventLogAggregateArgsSchema: z.ZodType<Prisma.EventLogAggregateArgs> = z.object({
  where: EventLogWhereInputSchema.optional(),
  orderBy: z.union([ EventLogOrderByWithRelationInputSchema.array(),EventLogOrderByWithRelationInputSchema ]).optional(),
  cursor: EventLogWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict()

export const EventLogGroupByArgsSchema: z.ZodType<Prisma.EventLogGroupByArgs> = z.object({
  where: EventLogWhereInputSchema.optional(),
  orderBy: z.union([ EventLogOrderByWithAggregationInputSchema.array(),EventLogOrderByWithAggregationInputSchema ]).optional(),
  by: EventLogScalarFieldEnumSchema.array(),
  having: EventLogScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict()

export const EventLogFindUniqueArgsSchema: z.ZodType<Prisma.EventLogFindUniqueArgs> = z.object({
  select: EventLogSelectSchema.optional(),
  include: EventLogIncludeSchema.optional(),
  where: EventLogWhereUniqueInputSchema,
}).strict()

export const EventLogFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.EventLogFindUniqueOrThrowArgs> = z.object({
  select: EventLogSelectSchema.optional(),
  include: EventLogIncludeSchema.optional(),
  where: EventLogWhereUniqueInputSchema,
}).strict()

export const VerificationTokenFindFirstArgsSchema: z.ZodType<Prisma.VerificationTokenFindFirstArgs> = z.object({
  select: VerificationTokenSelectSchema.optional(),
  where: VerificationTokenWhereInputSchema.optional(),
  orderBy: z.union([ VerificationTokenOrderByWithRelationInputSchema.array(),VerificationTokenOrderByWithRelationInputSchema ]).optional(),
  cursor: VerificationTokenWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ VerificationTokenScalarFieldEnumSchema,VerificationTokenScalarFieldEnumSchema.array() ]).optional(),
}).strict()

export const VerificationTokenFindFirstOrThrowArgsSchema: z.ZodType<Prisma.VerificationTokenFindFirstOrThrowArgs> = z.object({
  select: VerificationTokenSelectSchema.optional(),
  where: VerificationTokenWhereInputSchema.optional(),
  orderBy: z.union([ VerificationTokenOrderByWithRelationInputSchema.array(),VerificationTokenOrderByWithRelationInputSchema ]).optional(),
  cursor: VerificationTokenWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ VerificationTokenScalarFieldEnumSchema,VerificationTokenScalarFieldEnumSchema.array() ]).optional(),
}).strict()

export const VerificationTokenFindManyArgsSchema: z.ZodType<Prisma.VerificationTokenFindManyArgs> = z.object({
  select: VerificationTokenSelectSchema.optional(),
  where: VerificationTokenWhereInputSchema.optional(),
  orderBy: z.union([ VerificationTokenOrderByWithRelationInputSchema.array(),VerificationTokenOrderByWithRelationInputSchema ]).optional(),
  cursor: VerificationTokenWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ VerificationTokenScalarFieldEnumSchema,VerificationTokenScalarFieldEnumSchema.array() ]).optional(),
}).strict()

export const VerificationTokenAggregateArgsSchema: z.ZodType<Prisma.VerificationTokenAggregateArgs> = z.object({
  where: VerificationTokenWhereInputSchema.optional(),
  orderBy: z.union([ VerificationTokenOrderByWithRelationInputSchema.array(),VerificationTokenOrderByWithRelationInputSchema ]).optional(),
  cursor: VerificationTokenWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict()

export const VerificationTokenGroupByArgsSchema: z.ZodType<Prisma.VerificationTokenGroupByArgs> = z.object({
  where: VerificationTokenWhereInputSchema.optional(),
  orderBy: z.union([ VerificationTokenOrderByWithAggregationInputSchema.array(),VerificationTokenOrderByWithAggregationInputSchema ]).optional(),
  by: VerificationTokenScalarFieldEnumSchema.array(),
  having: VerificationTokenScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict()

export const VerificationTokenFindUniqueArgsSchema: z.ZodType<Prisma.VerificationTokenFindUniqueArgs> = z.object({
  select: VerificationTokenSelectSchema.optional(),
  where: VerificationTokenWhereUniqueInputSchema,
}).strict()

export const VerificationTokenFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.VerificationTokenFindUniqueOrThrowArgs> = z.object({
  select: VerificationTokenSelectSchema.optional(),
  where: VerificationTokenWhereUniqueInputSchema,
}).strict()

export const DH10ApplicationFindFirstArgsSchema: z.ZodType<Prisma.DH10ApplicationFindFirstArgs> = z.object({
  select: DH10ApplicationSelectSchema.optional(),
  include: DH10ApplicationIncludeSchema.optional(),
  where: DH10ApplicationWhereInputSchema.optional(),
  orderBy: z.union([ DH10ApplicationOrderByWithRelationInputSchema.array(),DH10ApplicationOrderByWithRelationInputSchema ]).optional(),
  cursor: DH10ApplicationWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ DH10ApplicationScalarFieldEnumSchema,DH10ApplicationScalarFieldEnumSchema.array() ]).optional(),
}).strict()

export const DH10ApplicationFindFirstOrThrowArgsSchema: z.ZodType<Prisma.DH10ApplicationFindFirstOrThrowArgs> = z.object({
  select: DH10ApplicationSelectSchema.optional(),
  include: DH10ApplicationIncludeSchema.optional(),
  where: DH10ApplicationWhereInputSchema.optional(),
  orderBy: z.union([ DH10ApplicationOrderByWithRelationInputSchema.array(),DH10ApplicationOrderByWithRelationInputSchema ]).optional(),
  cursor: DH10ApplicationWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ DH10ApplicationScalarFieldEnumSchema,DH10ApplicationScalarFieldEnumSchema.array() ]).optional(),
}).strict()

export const DH10ApplicationFindManyArgsSchema: z.ZodType<Prisma.DH10ApplicationFindManyArgs> = z.object({
  select: DH10ApplicationSelectSchema.optional(),
  include: DH10ApplicationIncludeSchema.optional(),
  where: DH10ApplicationWhereInputSchema.optional(),
  orderBy: z.union([ DH10ApplicationOrderByWithRelationInputSchema.array(),DH10ApplicationOrderByWithRelationInputSchema ]).optional(),
  cursor: DH10ApplicationWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ DH10ApplicationScalarFieldEnumSchema,DH10ApplicationScalarFieldEnumSchema.array() ]).optional(),
}).strict()

export const DH10ApplicationAggregateArgsSchema: z.ZodType<Prisma.DH10ApplicationAggregateArgs> = z.object({
  where: DH10ApplicationWhereInputSchema.optional(),
  orderBy: z.union([ DH10ApplicationOrderByWithRelationInputSchema.array(),DH10ApplicationOrderByWithRelationInputSchema ]).optional(),
  cursor: DH10ApplicationWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict()

export const DH10ApplicationGroupByArgsSchema: z.ZodType<Prisma.DH10ApplicationGroupByArgs> = z.object({
  where: DH10ApplicationWhereInputSchema.optional(),
  orderBy: z.union([ DH10ApplicationOrderByWithAggregationInputSchema.array(),DH10ApplicationOrderByWithAggregationInputSchema ]).optional(),
  by: DH10ApplicationScalarFieldEnumSchema.array(),
  having: DH10ApplicationScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict()

export const DH10ApplicationFindUniqueArgsSchema: z.ZodType<Prisma.DH10ApplicationFindUniqueArgs> = z.object({
  select: DH10ApplicationSelectSchema.optional(),
  include: DH10ApplicationIncludeSchema.optional(),
  where: DH10ApplicationWhereUniqueInputSchema,
}).strict()

export const DH10ApplicationFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.DH10ApplicationFindUniqueOrThrowArgs> = z.object({
  select: DH10ApplicationSelectSchema.optional(),
  include: DH10ApplicationIncludeSchema.optional(),
  where: DH10ApplicationWhereUniqueInputSchema,
}).strict()

export const AccountCreateArgsSchema: z.ZodType<Prisma.AccountCreateArgs> = z.object({
  select: AccountSelectSchema.optional(),
  include: AccountIncludeSchema.optional(),
  data: z.union([ AccountCreateInputSchema,AccountUncheckedCreateInputSchema ]),
}).strict()

export const AccountUpsertArgsSchema: z.ZodType<Prisma.AccountUpsertArgs> = z.object({
  select: AccountSelectSchema.optional(),
  include: AccountIncludeSchema.optional(),
  where: AccountWhereUniqueInputSchema,
  create: z.union([ AccountCreateInputSchema,AccountUncheckedCreateInputSchema ]),
  update: z.union([ AccountUpdateInputSchema,AccountUncheckedUpdateInputSchema ]),
}).strict()

export const AccountCreateManyArgsSchema: z.ZodType<Prisma.AccountCreateManyArgs> = z.object({
  data: z.union([ AccountCreateManyInputSchema,AccountCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict()

export const AccountDeleteArgsSchema: z.ZodType<Prisma.AccountDeleteArgs> = z.object({
  select: AccountSelectSchema.optional(),
  include: AccountIncludeSchema.optional(),
  where: AccountWhereUniqueInputSchema,
}).strict()

export const AccountUpdateArgsSchema: z.ZodType<Prisma.AccountUpdateArgs> = z.object({
  select: AccountSelectSchema.optional(),
  include: AccountIncludeSchema.optional(),
  data: z.union([ AccountUpdateInputSchema,AccountUncheckedUpdateInputSchema ]),
  where: AccountWhereUniqueInputSchema,
}).strict()

export const AccountUpdateManyArgsSchema: z.ZodType<Prisma.AccountUpdateManyArgs> = z.object({
  data: z.union([ AccountUpdateManyMutationInputSchema,AccountUncheckedUpdateManyInputSchema ]),
  where: AccountWhereInputSchema.optional(),
}).strict()

export const AccountDeleteManyArgsSchema: z.ZodType<Prisma.AccountDeleteManyArgs> = z.object({
  where: AccountWhereInputSchema.optional(),
}).strict()

export const SessionCreateArgsSchema: z.ZodType<Prisma.SessionCreateArgs> = z.object({
  select: SessionSelectSchema.optional(),
  include: SessionIncludeSchema.optional(),
  data: z.union([ SessionCreateInputSchema,SessionUncheckedCreateInputSchema ]),
}).strict()

export const SessionUpsertArgsSchema: z.ZodType<Prisma.SessionUpsertArgs> = z.object({
  select: SessionSelectSchema.optional(),
  include: SessionIncludeSchema.optional(),
  where: SessionWhereUniqueInputSchema,
  create: z.union([ SessionCreateInputSchema,SessionUncheckedCreateInputSchema ]),
  update: z.union([ SessionUpdateInputSchema,SessionUncheckedUpdateInputSchema ]),
}).strict()

export const SessionCreateManyArgsSchema: z.ZodType<Prisma.SessionCreateManyArgs> = z.object({
  data: z.union([ SessionCreateManyInputSchema,SessionCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict()

export const SessionDeleteArgsSchema: z.ZodType<Prisma.SessionDeleteArgs> = z.object({
  select: SessionSelectSchema.optional(),
  include: SessionIncludeSchema.optional(),
  where: SessionWhereUniqueInputSchema,
}).strict()

export const SessionUpdateArgsSchema: z.ZodType<Prisma.SessionUpdateArgs> = z.object({
  select: SessionSelectSchema.optional(),
  include: SessionIncludeSchema.optional(),
  data: z.union([ SessionUpdateInputSchema,SessionUncheckedUpdateInputSchema ]),
  where: SessionWhereUniqueInputSchema,
}).strict()

export const SessionUpdateManyArgsSchema: z.ZodType<Prisma.SessionUpdateManyArgs> = z.object({
  data: z.union([ SessionUpdateManyMutationInputSchema,SessionUncheckedUpdateManyInputSchema ]),
  where: SessionWhereInputSchema.optional(),
}).strict()

export const SessionDeleteManyArgsSchema: z.ZodType<Prisma.SessionDeleteManyArgs> = z.object({
  where: SessionWhereInputSchema.optional(),
}).strict()

export const UserCreateArgsSchema: z.ZodType<Prisma.UserCreateArgs> = z.object({
  select: UserSelectSchema.optional(),
  include: UserIncludeSchema.optional(),
  data: z.union([ UserCreateInputSchema,UserUncheckedCreateInputSchema ]).optional(),
}).strict()

export const UserUpsertArgsSchema: z.ZodType<Prisma.UserUpsertArgs> = z.object({
  select: UserSelectSchema.optional(),
  include: UserIncludeSchema.optional(),
  where: UserWhereUniqueInputSchema,
  create: z.union([ UserCreateInputSchema,UserUncheckedCreateInputSchema ]),
  update: z.union([ UserUpdateInputSchema,UserUncheckedUpdateInputSchema ]),
}).strict()

export const UserCreateManyArgsSchema: z.ZodType<Prisma.UserCreateManyArgs> = z.object({
  data: z.union([ UserCreateManyInputSchema,UserCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict()

export const UserDeleteArgsSchema: z.ZodType<Prisma.UserDeleteArgs> = z.object({
  select: UserSelectSchema.optional(),
  include: UserIncludeSchema.optional(),
  where: UserWhereUniqueInputSchema,
}).strict()

export const UserUpdateArgsSchema: z.ZodType<Prisma.UserUpdateArgs> = z.object({
  select: UserSelectSchema.optional(),
  include: UserIncludeSchema.optional(),
  data: z.union([ UserUpdateInputSchema,UserUncheckedUpdateInputSchema ]),
  where: UserWhereUniqueInputSchema,
}).strict()

export const UserUpdateManyArgsSchema: z.ZodType<Prisma.UserUpdateManyArgs> = z.object({
  data: z.union([ UserUpdateManyMutationInputSchema,UserUncheckedUpdateManyInputSchema ]),
  where: UserWhereInputSchema.optional(),
}).strict()

export const UserDeleteManyArgsSchema: z.ZodType<Prisma.UserDeleteManyArgs> = z.object({
  where: UserWhereInputSchema.optional(),
}).strict()

export const ReviewCreateArgsSchema: z.ZodType<Prisma.ReviewCreateArgs> = z.object({
  select: ReviewSelectSchema.optional(),
  include: ReviewIncludeSchema.optional(),
  data: z.union([ ReviewCreateInputSchema,ReviewUncheckedCreateInputSchema ]),
}).strict()

export const ReviewUpsertArgsSchema: z.ZodType<Prisma.ReviewUpsertArgs> = z.object({
  select: ReviewSelectSchema.optional(),
  include: ReviewIncludeSchema.optional(),
  where: ReviewWhereUniqueInputSchema,
  create: z.union([ ReviewCreateInputSchema,ReviewUncheckedCreateInputSchema ]),
  update: z.union([ ReviewUpdateInputSchema,ReviewUncheckedUpdateInputSchema ]),
}).strict()

export const ReviewCreateManyArgsSchema: z.ZodType<Prisma.ReviewCreateManyArgs> = z.object({
  data: z.union([ ReviewCreateManyInputSchema,ReviewCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict()

export const ReviewDeleteArgsSchema: z.ZodType<Prisma.ReviewDeleteArgs> = z.object({
  select: ReviewSelectSchema.optional(),
  include: ReviewIncludeSchema.optional(),
  where: ReviewWhereUniqueInputSchema,
}).strict()

export const ReviewUpdateArgsSchema: z.ZodType<Prisma.ReviewUpdateArgs> = z.object({
  select: ReviewSelectSchema.optional(),
  include: ReviewIncludeSchema.optional(),
  data: z.union([ ReviewUpdateInputSchema,ReviewUncheckedUpdateInputSchema ]),
  where: ReviewWhereUniqueInputSchema,
}).strict()

export const ReviewUpdateManyArgsSchema: z.ZodType<Prisma.ReviewUpdateManyArgs> = z.object({
  data: z.union([ ReviewUpdateManyMutationInputSchema,ReviewUncheckedUpdateManyInputSchema ]),
  where: ReviewWhereInputSchema.optional(),
}).strict()

export const ReviewDeleteManyArgsSchema: z.ZodType<Prisma.ReviewDeleteManyArgs> = z.object({
  where: ReviewWhereInputSchema.optional(),
}).strict()

export const EventLogCreateArgsSchema: z.ZodType<Prisma.EventLogCreateArgs> = z.object({
  select: EventLogSelectSchema.optional(),
  include: EventLogIncludeSchema.optional(),
  data: z.union([ EventLogCreateInputSchema,EventLogUncheckedCreateInputSchema ]),
}).strict()

export const EventLogUpsertArgsSchema: z.ZodType<Prisma.EventLogUpsertArgs> = z.object({
  select: EventLogSelectSchema.optional(),
  include: EventLogIncludeSchema.optional(),
  where: EventLogWhereUniqueInputSchema,
  create: z.union([ EventLogCreateInputSchema,EventLogUncheckedCreateInputSchema ]),
  update: z.union([ EventLogUpdateInputSchema,EventLogUncheckedUpdateInputSchema ]),
}).strict()

export const EventLogCreateManyArgsSchema: z.ZodType<Prisma.EventLogCreateManyArgs> = z.object({
  data: z.union([ EventLogCreateManyInputSchema,EventLogCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict()

export const EventLogDeleteArgsSchema: z.ZodType<Prisma.EventLogDeleteArgs> = z.object({
  select: EventLogSelectSchema.optional(),
  include: EventLogIncludeSchema.optional(),
  where: EventLogWhereUniqueInputSchema,
}).strict()

export const EventLogUpdateArgsSchema: z.ZodType<Prisma.EventLogUpdateArgs> = z.object({
  select: EventLogSelectSchema.optional(),
  include: EventLogIncludeSchema.optional(),
  data: z.union([ EventLogUpdateInputSchema,EventLogUncheckedUpdateInputSchema ]),
  where: EventLogWhereUniqueInputSchema,
}).strict()

export const EventLogUpdateManyArgsSchema: z.ZodType<Prisma.EventLogUpdateManyArgs> = z.object({
  data: z.union([ EventLogUpdateManyMutationInputSchema,EventLogUncheckedUpdateManyInputSchema ]),
  where: EventLogWhereInputSchema.optional(),
}).strict()

export const EventLogDeleteManyArgsSchema: z.ZodType<Prisma.EventLogDeleteManyArgs> = z.object({
  where: EventLogWhereInputSchema.optional(),
}).strict()

export const VerificationTokenCreateArgsSchema: z.ZodType<Prisma.VerificationTokenCreateArgs> = z.object({
  select: VerificationTokenSelectSchema.optional(),
  data: z.union([ VerificationTokenCreateInputSchema,VerificationTokenUncheckedCreateInputSchema ]),
}).strict()

export const VerificationTokenUpsertArgsSchema: z.ZodType<Prisma.VerificationTokenUpsertArgs> = z.object({
  select: VerificationTokenSelectSchema.optional(),
  where: VerificationTokenWhereUniqueInputSchema,
  create: z.union([ VerificationTokenCreateInputSchema,VerificationTokenUncheckedCreateInputSchema ]),
  update: z.union([ VerificationTokenUpdateInputSchema,VerificationTokenUncheckedUpdateInputSchema ]),
}).strict()

export const VerificationTokenCreateManyArgsSchema: z.ZodType<Prisma.VerificationTokenCreateManyArgs> = z.object({
  data: z.union([ VerificationTokenCreateManyInputSchema,VerificationTokenCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict()

export const VerificationTokenDeleteArgsSchema: z.ZodType<Prisma.VerificationTokenDeleteArgs> = z.object({
  select: VerificationTokenSelectSchema.optional(),
  where: VerificationTokenWhereUniqueInputSchema,
}).strict()

export const VerificationTokenUpdateArgsSchema: z.ZodType<Prisma.VerificationTokenUpdateArgs> = z.object({
  select: VerificationTokenSelectSchema.optional(),
  data: z.union([ VerificationTokenUpdateInputSchema,VerificationTokenUncheckedUpdateInputSchema ]),
  where: VerificationTokenWhereUniqueInputSchema,
}).strict()

export const VerificationTokenUpdateManyArgsSchema: z.ZodType<Prisma.VerificationTokenUpdateManyArgs> = z.object({
  data: z.union([ VerificationTokenUpdateManyMutationInputSchema,VerificationTokenUncheckedUpdateManyInputSchema ]),
  where: VerificationTokenWhereInputSchema.optional(),
}).strict()

export const VerificationTokenDeleteManyArgsSchema: z.ZodType<Prisma.VerificationTokenDeleteManyArgs> = z.object({
  where: VerificationTokenWhereInputSchema.optional(),
}).strict()

export const DH10ApplicationCreateArgsSchema: z.ZodType<Prisma.DH10ApplicationCreateArgs> = z.object({
  select: DH10ApplicationSelectSchema.optional(),
  include: DH10ApplicationIncludeSchema.optional(),
  data: z.union([ DH10ApplicationCreateInputSchema,DH10ApplicationUncheckedCreateInputSchema ]),
}).strict()

export const DH10ApplicationUpsertArgsSchema: z.ZodType<Prisma.DH10ApplicationUpsertArgs> = z.object({
  select: DH10ApplicationSelectSchema.optional(),
  include: DH10ApplicationIncludeSchema.optional(),
  where: DH10ApplicationWhereUniqueInputSchema,
  create: z.union([ DH10ApplicationCreateInputSchema,DH10ApplicationUncheckedCreateInputSchema ]),
  update: z.union([ DH10ApplicationUpdateInputSchema,DH10ApplicationUncheckedUpdateInputSchema ]),
}).strict()

export const DH10ApplicationCreateManyArgsSchema: z.ZodType<Prisma.DH10ApplicationCreateManyArgs> = z.object({
  data: z.union([ DH10ApplicationCreateManyInputSchema,DH10ApplicationCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict()

export const DH10ApplicationDeleteArgsSchema: z.ZodType<Prisma.DH10ApplicationDeleteArgs> = z.object({
  select: DH10ApplicationSelectSchema.optional(),
  include: DH10ApplicationIncludeSchema.optional(),
  where: DH10ApplicationWhereUniqueInputSchema,
}).strict()

export const DH10ApplicationUpdateArgsSchema: z.ZodType<Prisma.DH10ApplicationUpdateArgs> = z.object({
  select: DH10ApplicationSelectSchema.optional(),
  include: DH10ApplicationIncludeSchema.optional(),
  data: z.union([ DH10ApplicationUpdateInputSchema,DH10ApplicationUncheckedUpdateInputSchema ]),
  where: DH10ApplicationWhereUniqueInputSchema,
}).strict()

export const DH10ApplicationUpdateManyArgsSchema: z.ZodType<Prisma.DH10ApplicationUpdateManyArgs> = z.object({
  data: z.union([ DH10ApplicationUpdateManyMutationInputSchema,DH10ApplicationUncheckedUpdateManyInputSchema ]),
  where: DH10ApplicationWhereInputSchema.optional(),
}).strict()

export const DH10ApplicationDeleteManyArgsSchema: z.ZodType<Prisma.DH10ApplicationDeleteManyArgs> = z.object({
  where: DH10ApplicationWhereInputSchema.optional(),
}).strict()