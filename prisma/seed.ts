import { PrismaClient } from "@prisma/client";
import {
  AnswerRestrictionId,
  ANSWER_RESTRICTIONS,
} from "../src/server/db/answerRestrictions";

const prisma = new PrismaClient({ log: ["query", "error", "warn"] });

const QUESTION_IDS = [
  "first_name",
  "last_name",
  "birthday",
  "resume",
  "mac_experience_ventures",
  "study_enrolled_post_secondary",
  "study_location",
  "study_degree",
  "study_major",
  "study_year",
  "study_expected_grad",
  "prev_hackathons_count",
  "long_answer_1",
  "long_answer_2",
  "long_answer_3",
  "long_answer_4",
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
  "emergency_contact_name",
  "emergency_contact_relation",
  "emergency_contact_phone",
  "agree_to_mlh_code_of_conduct",
  "agree_to_mlh_privacy_policy",
  "agree_to_mlh_communications",
] as const;
type QuestionId = (typeof QUESTION_IDS)[number];

interface Question {
  id: QuestionId;
  statement: string;
  answerRestrictionId: AnswerRestrictionId;
}
const questions: Question[] = [
  {
    id: "first_name",
    statement: "First Name",
    answerRestrictionId: "string_255",
  },
  {
    id: "last_name",
    statement: "Last Name",
    answerRestrictionId: "string_255",
  },
  { id: "birthday", statement: "Birthday", answerRestrictionId: "date" },
  {
    id: "resume",
    statement: "Link to Resume",
    answerRestrictionId: "url_nullable",
  },
  {
    id: "mac_experience_ventures",
    statement:
      "Would you like to be a part of the McMaster Experience Ventures Program?",
    answerRestrictionId: "boolean",
  },
  {
    id: "study_enrolled_post_secondary",
    statement: "Are you currently enrolled in post-secondary education?",
    answerRestrictionId: "boolean",
  },
  {
    id: "study_location",
    statement: "Study Location",
    answerRestrictionId: "string_255_nullable",
  },
  {
    id: "study_degree",
    statement: "Study Degree",
    answerRestrictionId: "string_255_nullable",
  },
  {
    id: "study_major",
    statement: "Study Major",
    answerRestrictionId: "string_255_nullable",
  },
  {
    id: "study_year",
    statement: "Year of Study",
    answerRestrictionId: "string_255_nullable",
  },
  {
    id: "study_expected_grad",
    statement: "Expected Graduation",
    answerRestrictionId: "date_nullable",
  },
  {
    id: "prev_hackathons_count",
    statement: "Previous Hackathons Count",
    answerRestrictionId: "positive_number",
  },
  {
    id: "long_answer_1",
    statement:
      "DeltaHacks is the annual Hackathon for Change. If you had the ability to change anything in the world, what would it be and why?",
    answerRestrictionId: "long_answer_150",
  },
  {
    id: "long_answer_2",
    statement:
      "How do you hope to make the most out of your experience at DH10?",
    answerRestrictionId: "long_answer_150",
  },
  {
    id: "long_answer_3",
    statement:
      "Which piece of future technology excites you most and where do you see it going?",
    answerRestrictionId: "long_answer_150",
  },
  {
    id: "long_answer_4",
    statement:
      "You've been transported to an island with no clue of where you are. You are allowed 3 objects of your choice which will magically appear in front of you. How would you escape the island in time for DeltaHacks 10?",
    answerRestrictionId: "long_answer_150",
  },
  {
    id: "social_links",
    statement: "What are your social media links?",
    answerRestrictionId: "string_255_nullable",
  },
  {
    id: "interests",
    statement: "Is there anything else interesting you want us to know or see?",
    answerRestrictionId: "string_150_nullable",
  },
  {
    id: "tshirt_size",
    statement: "T-shirt Size",
    answerRestrictionId: "tshirt_size",
  },
  {
    id: "hacker_skill",
    statement: "What kind of hacker are you?",
    answerRestrictionId: "hacker_skills",
  },
  {
    id: "interested_workshops",
    statement: "What workshops are you interested in?",
    answerRestrictionId: "workshop_array",
  },
  {
    id: "how_discovered",
    statement: "How did you hear about DeltaHacks?",
    answerRestrictionId: "string_255_array",
  },
  { id: "gender", statement: "Gender", answerRestrictionId: "gender" },
  { id: "race", statement: "Race", answerRestrictionId: "string_255" },
  {
    id: "already_have_team",
    statement: "Do you already have a team?",
    answerRestrictionId: "boolean",
  },
  {
    id: "consider_coffee",
    statement:
      "Would you like to be considered for a coffee chat with a sponser?",
    answerRestrictionId: "boolean",
  },
  {
    id: "emergency_contact_name",
    statement: "Name of Emergency Contact",
    answerRestrictionId: "string",
  },
  {
    id: "emergency_contact_relation",
    statement: "Relation to Emergency Contact",
    answerRestrictionId: "string",
  },
  {
    id: "emergency_contact_phone",
    statement: "Emergency Contact Phone Number",
    answerRestrictionId: "phone_number",
  },
  {
    id: "agree_to_mlh_code_of_conduct",
    statement: "Agree to MLH Code of Conduct",
    answerRestrictionId: "boolean",
  },
  {
    id: "agree_to_mlh_privacy_policy",
    statement: "Agree to MLH Privacy Policy",
    answerRestrictionId: "boolean",
  },
  {
    id: "agree_to_mlh_communications",
    statement: "Agree to MLH Communications",
    answerRestrictionId: "boolean",
  },
];

const formQuestionCategories = [
  { name: "Education" },
  { name: "Emergency Contact" },
  { name: "Long Answer" },
  { name: "MLH Consent" },
  { name: "Personal Information" },
  { name: "Survey" },
] as const;
type FormQuestionCategoryId = (typeof formQuestionCategories)[number]["name"];

interface FormStructureQuestion {
  questionId: QuestionId;
  categoryId: FormQuestionCategoryId;
}

const createFormStructure = async (
  year: number,
  formStructureQuestions: FormStructureQuestion[]
) => {
  await prisma.formStructure.upsert({
    where: { year },
    update: { year },
    create: { year },
  });

  await Promise.all(
    formStructureQuestions.map(async (formQuestionOld, i) => {
      const formQuestion = {
        ...formQuestionOld,
        formYear: year,
        displayPriority: i,
      };
      await prisma.formStructureQuestion.upsert({
        where: {
          formYear_questionId: {
            formYear: formQuestion.formYear,
            questionId: formQuestion.questionId,
          },
        },
        update: formQuestion,
        create: formQuestion,
      });
    })
  );
};

const createDeltahacksXForm = async () => {
  const deltahacksXFormStructureQuestions: FormStructureQuestion[] = [
    { questionId: "first_name", categoryId: "Personal Information" },
    { questionId: "last_name", categoryId: "Personal Information" },
    { questionId: "birthday", categoryId: "Personal Information" },
    { questionId: "resume", categoryId: "Personal Information" },
    {
      questionId: "mac_experience_ventures",
      categoryId: "Personal Information",
    },

    { questionId: "study_enrolled_post_secondary", categoryId: "Education" },
    { questionId: "study_location", categoryId: "Education" },
    { questionId: "study_degree", categoryId: "Education" },
    { questionId: "study_major", categoryId: "Education" },
    { questionId: "study_year", categoryId: "Education" },
    { questionId: "study_expected_grad", categoryId: "Education" },
    { questionId: "prev_hackathons_count", categoryId: "Education" },

    { questionId: "long_answer_1", categoryId: "Long Answer" },
    { questionId: "long_answer_2", categoryId: "Long Answer" },
    { questionId: "long_answer_3", categoryId: "Long Answer" },
    { questionId: "long_answer_4", categoryId: "Long Answer" },

    { questionId: "social_links", categoryId: "Survey" },
    { questionId: "interests", categoryId: "Survey" },
    { questionId: "tshirt_size", categoryId: "Survey" },
    { questionId: "hacker_skill", categoryId: "Survey" },
    { questionId: "interested_workshops", categoryId: "Survey" },
    { questionId: "how_discovered", categoryId: "Survey" },
    { questionId: "gender", categoryId: "Survey" },
    { questionId: "race", categoryId: "Survey" },
    { questionId: "already_have_team", categoryId: "Survey" },
    { questionId: "consider_coffee", categoryId: "Survey" },

    { questionId: "emergency_contact_name", categoryId: "Emergency Contact" },
    {
      questionId: "emergency_contact_relation",
      categoryId: "Emergency Contact",
    },
    { questionId: "emergency_contact_phone", categoryId: "Emergency Contact" },

    { questionId: "agree_to_mlh_code_of_conduct", categoryId: "MLH Consent" },
    { questionId: "agree_to_mlh_privacy_policy", categoryId: "MLH Consent" },
    { questionId: "agree_to_mlh_communications", categoryId: "MLH Consent" },
  ];

  await createFormStructure(2024, deltahacksXFormStructureQuestions);
};

async function main() {
  const HACKATHON_YEAR_CONFIG = {
    id: "hackathonYear",
    name: "hackathonYear",
    value: "2024",
  };

  await prisma.config.upsert({
    where: {
      id: HACKATHON_YEAR_CONFIG.id,
    },
    create: HACKATHON_YEAR_CONFIG,
    update: HACKATHON_YEAR_CONFIG,
  });

  await Promise.all(
    ANSWER_RESTRICTIONS.map(
      async (answerRestriction) =>
        await prisma.answerRestriction.upsert({
          where: { id: answerRestriction.id },
          update: answerRestriction,
          create: answerRestriction,
        })
    )
  );

  await Promise.all(
    questions.map(async (question) => {
      await prisma.question.upsert({
        where: { id: question.id },
        update: question,
        create: question,
      });
    })
  );

  await Promise.all(
    formQuestionCategories.map(async (category) => {
      await prisma.formQuestionCategory.upsert({
        where: { name: category.name },
        update: category,
        create: category,
      });
    })
  );

  await createDeltahacksXForm();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
