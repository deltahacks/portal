/*
  Warnings:

  - The values [SPONSER] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Role_new" AS ENUM ('HACKER', 'ADMIN', 'REVIEWER', 'FOOD_MANAGER', 'EVENT_MANAGER', 'GENERAL_SCANNER', 'SPONSOR');
ALTER TABLE "User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "role" TYPE "Role_new"[] USING ("role"::text::"Role_new"[]);
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "Role_old";
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT ARRAY['HACKER']::"Role"[];
COMMIT;
