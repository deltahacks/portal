/*
  Warnings:

  - You are about to drop the column `answerTypeId` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the `AnswerType` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `answerRestrictionId` to the `Question` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Question" DROP CONSTRAINT "Question_answerTypeId_fkey";

-- AlterTable
ALTER TABLE "Question" DROP COLUMN "answerTypeId";
ALTER TABLE "Question" ADD COLUMN     "answerRestrictionId" STRING NOT NULL;

-- DropTable
DROP TABLE "AnswerType";

-- CreateTable
CREATE TABLE "AnswerRestriction" (
    "id" STRING NOT NULL,

    CONSTRAINT "AnswerRestriction_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_answerRestrictionId_fkey" FOREIGN KEY ("answerRestrictionId") REFERENCES "AnswerRestriction"("id") ON DELETE CASCADE ON UPDATE CASCADE;
