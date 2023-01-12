-- AlterTable
ALTER TABLE "User" ADD COLUMN     "lastMealTaken" TIMESTAMP(3),
ADD COLUMN     "mealsTaken" INTEGER NOT NULL DEFAULT 0;
