/*
  Warnings:

  - The required column `id` was added to the `AnswerType` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `required` to the `AnswerType` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Question" DROP CONSTRAINT "Question_answerTypeId_fkey";

-- AlterTable
ALTER TABLE "AnswerType" ADD COLUMN     "id" STRING NOT NULL;
ALTER TABLE "AnswerType" ADD COLUMN     "required" BOOL NOT NULL;

-- AlterPrimaryKey
ALTER TABLE "AnswerType" ALTER PRIMARY KEY USING COLUMNS ("id");

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_answerTypeId_fkey" FOREIGN KEY ("answerTypeId") REFERENCES "AnswerType"("id") ON DELETE CASCADE ON UPDATE CASCADE;
