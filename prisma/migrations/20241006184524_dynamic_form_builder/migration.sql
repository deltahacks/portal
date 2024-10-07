/*
  Warnings:

  - Added the required column `name` to the `FormStructure` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "FormStructure" ADD COLUMN     "name" STRING NOT NULL;
