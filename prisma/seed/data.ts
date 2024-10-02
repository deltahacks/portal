export const QUESTIONS = [
  {
    id: "first_name",
    statement: "First Name",
  },
  {
    id: "last_name",
    statement: "Last Name",
  },
  { id: "birthday", statement: "Birthday" },
  {
    id: "resume",
    statement: "Link to Resume",
  },
  {
    id: "mac_experience_ventures",
    statement:
      "Would you like to be a part of the McMaster Experience Ventures Program?",
  },
  {
    id: "study_enrolled_post_secondary",
    statement: "Are you currently enrolled in post-secondary education?",
  },
  {
    id: "study_location",
    statement: "Study Location",
  },
  {
    id: "study_degree",
    statement: "Study Degree",
  },
  {
    id: "study_major",
    statement: "Study Major",
  },
  {
    id: "study_year",
    statement: "Year of Study",
  },
  {
    id: "study_expected_grad",
    statement: "Expected Graduation",
  },
  {
    id: "prev_hackathons_count",
    statement: "Previous Hackathons Count",
  },
  {
    id: "long_answer_1",
    statement:
      "DeltaHacks is the annual Hackathon for Change. If you had the ability to change anything in the world, what would it be and why?",
  },
  {
    id: "long_answer_2",
    statement:
      "How do you hope to make the most out of your experience at DH10?",
  },
  {
    id: "long_answer_3",
    statement:
      "Which piece of future technology excites you most and where do you see it going?",
  },
  {
    id: "long_answer_4",
    statement:
      "You've been transported to an island with no clue of where you are. You are allowed 3 objects of your choice which will magically appear in front of you. How would you escape the island in time for DeltaHacks 10?",
  },
  {
    id: "social_links",
    statement: "What are your social media links?",
  },
  {
    id: "interests",
    statement: "Is there anything else interesting you want us to know or see?",
  },
  {
    id: "tshirt_size",
    statement: "T-shirt Size",
  },
  {
    id: "hacker_skill",
    statement: "What kind of hacker are you?",
  },
  {
    id: "interested_workshops",
    statement: "What workshops are you interested in?",
  },
  {
    id: "how_discovered",
    statement: "How did you hear about DeltaHacks?",
  },
  { id: "gender", statement: "Gender" },
  { id: "race", statement: "Race" },
  {
    id: "already_have_team",
    statement: "Do you already have a team?",
  },
  {
    id: "consider_coffee",
    statement:
      "Would you like to be considered for a coffee chat with a sponsor?",
  },
  {
    id: "emergency_contact_name",
    statement: "Name of Emergency Contact",
  },
  {
    id: "emergency_contact_relation",
    statement: "Relation to Emergency Contact",
  },
  {
    id: "emergency_contact_phone",
    statement: "Emergency Contact Phone Number",
  },
  {
    id: "agree_to_mlh_code_of_conduct",
    statement: "Agree to MLH Code of Conduct",
  },
  {
    id: "agree_to_mlh_privacy_policy",
    statement: "Agree to MLH Privacy Policy",
  },
  {
    id: "agree_to_mlh_communications",
    statement: "Agree to MLH Communications",
  },
] as const;

type QuestionId = (typeof QUESTIONS)[number]["id"];

export const FORM_QUESTION_CATEGORIES = [
  { name: "Education" },
  { name: "Emergency Contact" },
  { name: "Long Answer" },
  { name: "MLH Consent" },
  { name: "Personal Information" },
  { name: "Survey" },
] as const;
type FormQuestionCategoryId = (typeof FORM_QUESTION_CATEGORIES)[number]["name"];

interface FormStructureCategory {
  categoryId: FormQuestionCategoryId;
  questions: QuestionId[];
}

export interface FormStructure {
  id: string;
  categories: FormStructureCategory[];
}

export const FORM_STRUCTURES: FormStructure[] = [
  {
    id: "DeltaHacks X Application Form",
    categories: [
      {
        categoryId: "Personal Information",
        questions: [
          "first_name",
          "last_name",
          "birthday",
          "resume",
          "mac_experience_ventures",
        ],
      },
      {
        categoryId: "Education",
        questions: [
          "study_enrolled_post_secondary",
          "study_location",
          "study_degree",
          "study_major",
          "study_year",
          "study_expected_grad",
          "prev_hackathons_count",
        ],
      },
      {
        categoryId: "Long Answer",
        questions: [
          "long_answer_1",
          "long_answer_2",
          "long_answer_3",
          "long_answer_4",
        ],
      },
      {
        categoryId: "Survey",
        questions: [
          "social_links",
          "interests",
          "tshirt_size",
          "hacker_skill",
          "interested_workshops",
          "how_discovered",
          "gender",
          "race",
          "already_have_team",
          "consider_coffee",
        ],
      },
      {
        categoryId: "Emergency Contact",
        questions: [
          "emergency_contact_name",
          "emergency_contact_relation",
          "emergency_contact_phone",
        ],
      },
      {
        categoryId: "MLH Consent",
        questions: [
          "agree_to_mlh_code_of_conduct",
          "agree_to_mlh_privacy_policy",
          "agree_to_mlh_communications",
        ],
      },
    ],
  },
];

export const DELTAHACKS_APPLICATION_FORM_CONFIG = {
  id: "DeltaHacksApplication",
  name: "DeltaHacksApplication",
  value: "DeltaHacks X Application Form",
};
