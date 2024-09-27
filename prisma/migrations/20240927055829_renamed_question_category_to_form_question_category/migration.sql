/*
  Warnings:

  - You are about to drop the column `categoryId` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the `QuestionCategory` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `categoryId` to the `FormStructureQuestion` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Question" DROP CONSTRAINT "Question_categoryId_fkey";

-- AlterTable
ALTER TABLE "FormStructureQuestion" ADD COLUMN     "categoryId" STRING NOT NULL;

-- AlterTable
ALTER TABLE "Question" DROP COLUMN "categoryId";

-- DropTable
DROP TABLE "QuestionCategory";

-- CreateTable
CREATE TABLE "FormQuestionCategory" (
    "name" STRING NOT NULL,

    CONSTRAINT "FormQuestionCategory_pkey" PRIMARY KEY ("name")
);

-- AddForeignKey
ALTER TABLE "FormStructureQuestion" ADD CONSTRAINT "FormStructureQuestion_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "FormQuestionCategory"("name") ON DELETE CASCADE ON UPDATE CASCADE;
