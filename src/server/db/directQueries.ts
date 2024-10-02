import { PrismaClient } from "@prisma/client";

export class DirectPrismaQuerier {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async getDeltaHacksApplicationFormName() {
    const deltaHacksApplicationFormConfig =
      await this.prisma.config.findFirstOrThrow({
        where: {
          id: "DeltaHacksApplication",
        },
      });
    return deltaHacksApplicationFormConfig.value;
  }

  async hasKilledApplications() {
    const killedStr = await this.prisma.config.findFirst({
      where: { name: "killApplications" },
      select: { value: true },
    });
    // they are killed in all cases unless the value is "false"
    const shouldBeKilled = !killedStr || JSON.parse(killedStr.value) !== false;
    return shouldBeKilled;
  }

  async getUserApplication(userId: string) {
    const formName = await this.getDeltaHacksApplicationFormName();
    const userApplication = await this.prisma.formSubmission.findFirst({
      where: {
        formStructureId: formName,
        submitterId: userId,
      },
    });
    return userApplication;
  }
}
