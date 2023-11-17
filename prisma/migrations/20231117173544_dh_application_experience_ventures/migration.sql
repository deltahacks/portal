/*
  Warnings:

  - Added the required column `macEv` to the `DH10Application` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "DH10Application" ADD COLUMN     "macEv" BOOL NOT NULL;
