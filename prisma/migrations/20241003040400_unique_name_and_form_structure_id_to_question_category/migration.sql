/*
  Warnings:

  - A unique constraint covering the columns `[name,formStructureId]` on the table `QuestionCategory` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "QuestionCategory_name_formStructureId_key" ON "QuestionCategory"("name", "formStructureId");
