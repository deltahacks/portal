import { PrismaClient } from "@prisma/client";

export class DirectPrismaQuerier {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async getHackathonYear() {
    const hackathonYearConfig = await this.prisma.config.findFirstOrThrow({
      where: {
        id: "hackathonYear",
      },
    });
    return parseInt(hackathonYearConfig.value);
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
    const hackathonYear = await this.getHackathonYear();
    const userApplication = await this.prisma.formSubmission.findFirst({
      where: { formYear: hackathonYear, submitterId: userId },
    });
    return userApplication;
  }
}
