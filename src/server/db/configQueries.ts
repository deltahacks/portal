import { PrismaClient } from "@prisma/client";
import { assert } from "../../utils/asserts";

export const getDeltaHacksApplicationFormName = async (
  prisma: PrismaClient
) => {
  const deltaHacksApplicationFormConfig = await prisma.config.findUnique({
    where: {
      id: "CurrentDeltaHacksApplication",
    },
  });
  if (!deltaHacksApplicationFormConfig) {
    return null;
  }

  assert(
    deltaHacksApplicationFormConfig.value.length > 0,
    "Invalid DeltaHacksApplicationConfig value"
  );
  return deltaHacksApplicationFormConfig.value;
};

export const hasKilledApplications = async (prisma: PrismaClient) => {
  const killedConfig = await prisma.config.findFirst({
    where: { name: "killApplications" },
    select: { value: true },
  });

  // Default behaviour if config isn't present
  if (!killedConfig) {
    return true;
  }
  try {
    return JSON.parse(killedConfig.value) === true;
  } catch (error) {
    console.error("Invalid killApplications configuration:", error);
    throw error;
  }
};
