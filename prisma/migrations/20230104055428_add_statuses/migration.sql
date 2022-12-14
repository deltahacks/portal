-- CreateEnum
CREATE TYPE "Status" AS ENUM ('IN_REVIEW', 'REJECTED', 'WAITLISTED', 'ACCEPTED', 'RSVP', 'CHECKED_IN');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "status" "Status" NOT NULL DEFAULT 'IN_REVIEW';
