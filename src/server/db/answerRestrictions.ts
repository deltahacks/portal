export const ANSWER_RESTRICTIONS = [
  { id: "string" },
  { id: "string_nullable" },
  { id: "string_255" },
  { id: "string_255_nullable" },
  { id: "string_255_array" },
  { id: "string_150" },
  { id: "string_150_nullable" },
  { id: "long_answer_150" },
  { id: "boolean" },
  { id: "url_nullable" },
  { id: "date" },
  { id: "date_nullable" },
  { id: "positive_number" },
  { id: "phone_number" },
  { id: "tshirt_size" },
  { id: "workshop_array" },
  { id: "hacker_skills" },
  { id: "gender" },
] as const;

export type AnswerRestrictionId = (typeof ANSWER_RESTRICTIONS)[number]["id"];
