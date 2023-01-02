import { Role } from "@prisma/client";
import { z } from "zod";
import { createProtectedRouter } from "./context";

export const userRouter = createProtectedRouter().query("byRole", {
  input: z.object({ role: z.nativeEnum(Role) }),
  async resolve({ ctx, input }) {
    return await prisma?.user.findMany({
      where: {
        role: {
          has: input.role,
        },
      },
    });
  },
});
