import { z } from "zod";
import { protectedProcedure, router } from "./trpc";
import { PrismaClient } from "@prisma/client";
import { assert } from "../../utils/asserts";

const FormStructure = z.object({
  name: z.string(),
  categories: z
    .object({
      name: z.string(),
      questions: z.string().array(),
    })
    .array(),
});

export type FormStructure = z.infer<typeof FormStructure>;

export const createForm = async (
  prisma: PrismaClient,
  formStructure: FormStructure
) => {
  const form = await prisma.formStructure.create({
    data: { name: formStructure.name },
  });

  await prisma.questionCategory.createMany({
    data: formStructure.categories.map(({ name }, i) => ({
      formStructureId: form.id,
      name,
      formPosition: i,
    })),
    skipDuplicates: true,
  });

  const categories = await prisma.questionCategory.findMany({
    where: {
      formStructureId: form.id,
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

export const fileBuilder = router({
  createForm: protectedProcedure
    .input(FormStructure)
    .mutation(async ({ ctx, input: formStructure }) => {
      await createForm(ctx.prisma, formStructure);
    }),
});
