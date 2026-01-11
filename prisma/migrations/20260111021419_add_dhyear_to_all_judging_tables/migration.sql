/*
  Warnings:

  - A unique constraint covering the columns `[number,dhYear]` on the table `Table` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,dhYear]` on the table `Track` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `dhYear` to the `Table` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dhYear` to the `Track` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Table_number_key";

-- DropIndex
DROP INDEX "Track_name_key";

-- AlterTable Table
ALTER TABLE "Table" ADD COLUMN "dhYear" STRING;
UPDATE "Table" SET "dhYear" = 'DH11' WHERE "dhYear" IS NULL;
ALTER TABLE "Table" ALTER COLUMN "dhYear" SET NOT NULL;

-- AlterTable
ALTER TABLE "Track" ADD COLUMN "dhYear" STRING;
UPDATE "Track" SET "dhYear" = 'DH11' WHERE "dhYear" IS NULL;
ALTER TABLE "Track" ALTER COLUMN "dhYear" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Table_number_dhYear_key" ON "Table"("number", "dhYear");

-- CreateIndex
CREATE UNIQUE INDEX "Track_name_dhYear_key" ON "Track"("name", "dhYear");
