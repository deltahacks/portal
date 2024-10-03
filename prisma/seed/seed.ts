import { PrismaClient } from "@prisma/client";
import {
  DELTAHACKS_APPLICATION_FORM_CONFIG,
  FORM_STRUCTURES,
  FormStructure,
} from "./data";

const prisma = new PrismaClient({
  log: ["query", "error", "warn"],
});

const createFormStructure = async (formStructure: FormStructure) => {
  await prisma.formStructure.createMany({
    data: { id: formStructure.id },
    skipDuplicates: true,
  });

  await prisma.questionCategory.createMany({
    data: formStructure.categories.map(({ name }) => ({
      formStructureId: formStructure.id,
      name,
    })),
    skipDuplicates: true,
  });

  const questions = formStructure.categories.flatMap(
    ({ name: categoryName, questions }) =>
      questions.map((question) => ({ categoryName, question }))
  );

  await prisma.question.createMany({
    data: questions.map(({ categoryName, question }, i) => ({
      statement: question,
      displayPriority: i,
      formStructureId: formStructure.id,
      categoryName,
    })),
    skipDuplicates: true,
  });
};

async function main() {
  if (process.env.NODE_ENV === "production") {
    console.error("Seeding is not allowed in production environment");
    process.exit(1);
  }

  await prisma.config.upsert({
    where: {
      id: DELTAHACKS_APPLICATION_FORM_CONFIG.id,
    },
    create: DELTAHACKS_APPLICATION_FORM_CONFIG,
    update: DELTAHACKS_APPLICATION_FORM_CONFIG,
  });

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
