import { PrismaClient } from "@prisma/client";
import { assert } from "../../src/utils/asserts";
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
    data: formStructure.categories.map(({ name }, i) => ({
      formStructureId: formStructure.id,
      name,
      formPosition: i,
    })),
    skipDuplicates: true,
  });

  const categories = await prisma.questionCategory.findMany({
    where: {
      formStructureId: formStructure.id,
    },
    select: {
      id: true,
      name: true,
    },
  });

  assert(
    categories.length >= formStructure.categories.length,
    "All categories should've been added before"
  );

  const categoryNameToIdMap = new Map(
    categories.map(({ id, name }) => [name, id])
  );

  await Promise.all(
    formStructure.categories.map(async ({ name: categoryName, questions }) => {
      const categoryId = categoryNameToIdMap.get(categoryName);
      assert(categoryId);

      try {
        await prisma.question.createMany({
          data: questions.map((question, i) => {
            return {
              statement: question,
              categoryPosition: i,
              categoryId,
            };
          }),
          skipDuplicates: true,
        });
      } catch (e) {
        console.error(
          `Error occured while adding the following: categoryName: ${categoryName}, categoryId: ${categoryId}, questions:`,
          questions
        );
        throw e;
      }
    })
  );
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
