/*
  Warnings:

  - You are about to drop the column `event` on the `EventLog` table. All the data in the column will be lost.
  - Added the required column `station` to the `EventLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `EventLog` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "EventLog" DROP COLUMN "event";
ALTER TABLE "EventLog" ADD COLUMN     "station" STRING NOT NULL;
ALTER TABLE "EventLog" ADD COLUMN     "type" STRING NOT NULL;
