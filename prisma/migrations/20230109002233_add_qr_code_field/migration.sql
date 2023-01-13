/*
  Warnings:

  - A unique constraint covering the columns `[qrcode]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "qrcode" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "User_qrcode_key" ON "User"("qrcode");
