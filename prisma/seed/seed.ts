import { PrismaClient } from "@prisma/client";
import { createForm } from "../../src/server/router/formBuilder";
import { DELTAHACKS_APPLICATION_FORM_CONFIG, FORM_STRUCTURES } from "./data";

const prisma = new PrismaClient({
  log: ["query", "error", "warn"],
});

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
      await createForm(prisma, structure);
    })
  );
}

main()
  .catch(async (e) => {
    console.error("Error occurred during database seeding:");
    console.error(e);
    if (e.stack) {
      console.error("Stack trace:");
      console.error(e.stack);
    }
  })
  .finally(async () => {
    console.log("Disconnecting from database...");
    await prisma.$disconnect();
    console.log("Disconnected from database.");
  });
