/*
  Warnings:

  - A unique constraint covering the columns `[userId,stationId]` on the table `EventLog` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "EventLog_userId_stationId_key" ON "EventLog"("userId", "stationId");
