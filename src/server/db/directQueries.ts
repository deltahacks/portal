import { PrismaClient } from "@prisma/client";
import { assert } from "../../utils/asserts";

/**
 * General purpose class for common prisma queries. Mainly used in
 * getServerSideProps calls or calling specific config settings.
 *
 * IMPORTANT: Use wherever prisma is used. So only use this in the
 *            server and not in user facing components (front-end)
 */
export class DirectPrismaQuerier {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async getDeltaHacksApplicationFormName() {
    const deltaHacksApplicationFormConfig = await this.prisma.config.findUnique(
      {
        where: {
          id: "DeltaHacksApplication",
        },
      }
    );
    if (!deltaHacksApplicationFormConfig) {
      return null;
    }

    assert(
      deltaHacksApplicationFormConfig.value.length > 0,
      "Invalid DeltaHacksApplicationConfig value"
    );
    return deltaHacksApplicationFormConfig.value;
  }

  async hasKilledApplications() {
    const killedConfig = await this.prisma.config.findFirst({
      where: { name: "killApplications" },
      select: { value: true },
    });

    // Default behaviour if config isn't present
    if (!killedConfig) {
      return true;
    }
    try {
      return JSON.parse(killedConfig.value) !== false;
    } catch (error) {
      console.error("Invalid killApplications configuration:", error);
      throw error;
    }
  }

  async getUserApplication(userId: string) {
    const formName = await this.getDeltaHacksApplicationFormName();
    if (!formName) {
      return null;
    }

    const userApplication = await this.prisma.formSubmission.findFirst({
      where: {
        formStructureId: formName,
        submitterId: userId,
      },
    });
    return userApplication;
  }
}
