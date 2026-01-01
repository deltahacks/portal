-- DropTable
DROP TABLE IF EXISTS "EventLog";

-- CreateTable
CREATE TABLE "EventLog" (
    "id" STRING NOT NULL,
    "userId" STRING NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "station" STRING NOT NULL,
    "type" STRING NOT NULL,

    CONSTRAINT "EventLog_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "EventLog" ADD CONSTRAINT "EventLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
