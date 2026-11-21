import type { PrismaClient } from "@prisma/client";

export async function getCurrentScanYear(
  prisma: PrismaClient,
): Promise<string> {
  const config = await prisma.config.findUnique({ where: { name: "dhYear" } });
  return config?.value || "DH13";
}
