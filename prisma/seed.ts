import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({ log: ["query", "error", "warn"] });

const QUESTIONS = [
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
      "Would you like to be considered for a coffee chat with a sponser?",
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

const FORM_QUESTION_CATEGORIES = [
  { name: "Education" },
  { name: "Emergency Contact" },
  { name: "Long Answer" },
  { name: "MLH Consent" },
  { name: "Personal Information" },
  { name: "Survey" },
] as const;
type FormQuestionCategoryId = (typeof FORM_QUESTION_CATEGORIES)[number]["name"];

interface FormStructureQuestion {
  questionId: QuestionId;
  categoryId: FormQuestionCategoryId;
}

const createDeltahacksXForm = async () => {
  const DELTAHACKS_X_FORM_STRUCTURE_QUESTIONS: FormStructureQuestion[] = [
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

  await createFormStructure(
    "DeltaHacks X Application Form",
    DELTAHACKS_X_FORM_STRUCTURE_QUESTIONS
  );
};

const createFormStructure = async (
  deltaHacksApplicationFormName: string,
  formStructureQuestions: FormStructureQuestion[]
) => {
  await prisma.formStructure.upsert({
    where: { id: deltaHacksApplicationFormName },
    update: { id: deltaHacksApplicationFormName },
    create: { id: deltaHacksApplicationFormName },
  });

  await Promise.all(
    formStructureQuestions.map(async (formQuestionOld, i) => {
      const formQuestion = {
        ...formQuestionOld,
        formStructureId: deltaHacksApplicationFormName,
        displayPriority: i,
      };
      await prisma.formStructureQuestion.upsert({
        where: {
          formStructureId_questionId: {
            formStructureId: formQuestion.formStructureId,
            questionId: formQuestion.questionId,
          },
        },
        update: formQuestion,
        create: formQuestion,
      });
    })
  );
};

const DELTAHACKS_APPLICATION_FORM_CONFIG = {
  id: "DeltaHacksApplication",
  name: "DeltaHacksApplication",
  value: "DeltaHacks X Application Form",
};

async function main() {
  await prisma.config.upsert({
    where: {
      id: DELTAHACKS_APPLICATION_FORM_CONFIG.id,
    },
    create: DELTAHACKS_APPLICATION_FORM_CONFIG,
    update: DELTAHACKS_APPLICATION_FORM_CONFIG,
  });

  await Promise.all(
    QUESTIONS.map(async (question) => {
      await prisma.question.upsert({
        where: { id: question.id },
        update: question,
        create: question,
      });
    })
  );

  await Promise.all(
    FORM_QUESTION_CATEGORIES.map(async (category) => {
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
