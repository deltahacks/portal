/*
  Warnings:

  - Added the required column `lastMealTaken` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "lastMealTaken" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "mealsTaken" INTEGER NOT NULL DEFAULT 0;
