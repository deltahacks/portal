/*
  Warnings:

  - You are about to drop the column `station` on the `EventLog` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `EventLog` table. All the data in the column will be lost.
  - Added the required column `stationId` to the `EventLog` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "EventLog" DROP COLUMN "station";
ALTER TABLE "EventLog" DROP COLUMN "type";
ALTER TABLE "EventLog" ADD COLUMN     "stationId" STRING NOT NULL;

-- CreateTable
CREATE TABLE "Station" (
    "id" STRING NOT NULL,
    "name" STRING NOT NULL,
    "option" STRING NOT NULL,

    CONSTRAINT "Station_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Station_name_option_key" ON "Station"("name", "option");

-- AddForeignKey
ALTER TABLE "EventLog" ADD CONSTRAINT "EventLog_stationId_fkey" FOREIGN KEY ("stationId") REFERENCES "Station"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
