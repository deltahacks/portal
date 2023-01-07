/*
  Warnings:

  - You are about to drop the `Example` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('HACKER', 'ADMIN', 'REVIEWER');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" "Role"[] DEFAULT ARRAY['HACKER']::"Role"[];

-- DropTable
DROP TABLE "Example";
