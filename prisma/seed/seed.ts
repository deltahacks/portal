import { FormStructureQuestion, PrismaClient } from "@prisma/client";
import {
  DELTAHACKS_APPLICATION_FORM_CONFIG,
  QUESTIONS,
  FORM_QUESTION_CATEGORIES,
  FORM_STRUCTURES,
  FormStructure,
} from "./data";

const prisma = new PrismaClient({
  log:
    process.env.NODE_ENV === "production"
      ? ["error"]
      : ["query", "error", "warn"],
});

const createFormStructure = async (formStructure: FormStructure) => {
  await prisma.formStructure.upsert({
    where: { id: formStructure.id },
    update: { id: formStructure.id },
    create: { id: formStructure.id },
  });

  const formStructureQuestions = formStructure.categories.flatMap(
    ({ categoryId, questions }) =>
      questions.map((questionId) => ({ categoryId, questionId }))
  );

  await Promise.all(
    formStructureQuestions.map(async ({ categoryId, questionId }, i) => {
      const formStructureQuestion: FormStructureQuestion = {
        categoryId: categoryId,
        questionId,
        formStructureId: formStructure.id,
        displayPriority: i,
      };

      await prisma.formStructureQuestion.upsert({
        where: {
          formStructureId_questionId: {
            formStructureId: formStructureQuestion.formStructureId,
            questionId: formStructureQuestion.questionId,
          },
        },
        update: formStructureQuestion,
        create: formStructureQuestion,
      });
    })
  );
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

  await Promise.all(
    FORM_STRUCTURES.map(async (structure) => {
      await createFormStructure(structure);
    })
  );
}

main()
  .catch((e) => {
    console.error("Error occurred during database seeding:");
    console.error(e);
    if (e.stack) {
      console.error("Stack trace:");
      console.error(e.stack);
    }
    process.exit(1);
  })
  .finally(async () => {
    console.log("Disconnecting from database...");
    await prisma.$disconnect();
    console.log("Disconnected from database.");
  });
