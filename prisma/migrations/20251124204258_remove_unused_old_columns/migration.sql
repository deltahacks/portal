/*
  Warnings:

  - You are about to drop the column `lastMealTaken` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `mealsTaken` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `typeform_response_id` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "lastMealTaken";
ALTER TABLE "User" DROP COLUMN "mealsTaken";
ALTER TABLE "User" DROP COLUMN "typeform_response_id";
