/*
  Warnings:

  - You are about to drop the column `is_array` on the `AnswerType` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "AnswerType" DROP COLUMN "is_array";
ALTER TABLE "AnswerType" ADD COLUMN     "isArray" BOOL NOT NULL DEFAULT false;
