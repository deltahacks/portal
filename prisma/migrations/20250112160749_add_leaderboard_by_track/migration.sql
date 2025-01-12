/*
  Warnings:

  - Added the required column `tableId` to the `JudgingResult` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "JudgingResult" ADD COLUMN     "tableId" STRING NOT NULL;

-- AddForeignKey
ALTER TABLE "JudgingResult" ADD CONSTRAINT "JudgingResult_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "Table"("id") ON DELETE CASCADE ON UPDATE CASCADE;
