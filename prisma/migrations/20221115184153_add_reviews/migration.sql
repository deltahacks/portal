-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "hackerId" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "mark" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_hackerId_fkey" FOREIGN KEY ("hackerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
