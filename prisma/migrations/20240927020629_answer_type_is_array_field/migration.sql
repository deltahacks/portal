-- AlterTable
ALTER TABLE "AnswerType" ADD COLUMN     "is_array" BOOL NOT NULL DEFAULT false;
ALTER TABLE "AnswerType" ALTER COLUMN "required" SET DEFAULT false;
