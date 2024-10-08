import { z } from "zod";
import { protectedProcedure, router } from "./trpc";
import { PrismaClient } from "@prisma/client";
import { trpcAssert } from "../../utils/asserts";

const FormStructure = z.object({
  name: z.string(),
  formItems: z
    .object({
      itemType: z.enum(["category", "question"]),
      statement: z.string(),
      placeholder: z.string().optional(),
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

  const formItems = await prisma.formItem.createManyAndReturn({
    data: formStructure.formItems.map(({ statement }, i) => ({
      formStructureId: form.id,
      statement,
      formPosition: i,
    })),
  });

  await prisma.question.createMany({
    data: formStructure.formItems
      .map(({ itemType }, formPosition) => ({ itemType, formPosition }))
      .filter(({ itemType }) => itemType == "question")
      .map(({ formPosition }) => {
        // The above list operations were to obtain this formItem
        // to create questions.
        const formItem = formItems.find(
          (item) => item.formPosition == formPosition
        );

        trpcAssert(formItem, "NOT_FOUND");
        return {
          formItemId: formItem?.id,
        };
      }),
  });
};

export const fileBuilder = router({
  createForm: protectedProcedure
    .input(FormStructure)
    .mutation(async ({ ctx, input: formStructure }) => {
      await createForm(ctx.prisma, formStructure);
    }),
});
