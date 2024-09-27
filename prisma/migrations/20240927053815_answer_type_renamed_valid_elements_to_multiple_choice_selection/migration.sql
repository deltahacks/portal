/*
  Warnings:

  - You are about to drop the column `validElements` on the `AnswerType` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "AnswerType" DROP COLUMN "validElements";
ALTER TABLE "AnswerType" ADD COLUMN     "multipleChoiceSelection" JSONB;
