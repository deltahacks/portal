/*
  Warnings:

  - A unique constraint covering the columns `[dH11ApplicationId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "YesNoUnsure" AS ENUM ('YES', 'NO', 'UNSURE');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "dH11ApplicationId" STRING;

-- CreateTable
CREATE TABLE "DH11Application" (
    "id" STRING NOT NULL,
    "firstName" STRING NOT NULL,
    "lastName" STRING NOT NULL,
    "birthday" TIMESTAMP(3) NOT NULL,
    "studyEnrolledPostSecondary" BOOL NOT NULL,
    "studyLocation" STRING,
    "studyDegree" STRING,
    "studyMajor" STRING,
    "studyYearOfStudy" STRING,
    "studyExpectedGraduation" TIMESTAMP(3),
    "previousHackathonsCount" INT4 NOT NULL,
    "longAnswerIncident" STRING NOT NULL,
    "longAnswerGoals" STRING NOT NULL,
    "longAnswerFood" STRING NOT NULL,
    "longAnswerTravel" STRING NOT NULL,
    "longAnswerSocratica" STRING NOT NULL,
    "socialText" STRING[] DEFAULT ARRAY[]::STRING[],
    "interests" STRING,
    "linkToResume" STRING,
    "tshirtSize" STRING NOT NULL,
    "hackerKind" STRING[] DEFAULT ARRAY[]::STRING[],
    "alreadyHaveTeam" BOOL NOT NULL,
    "workshopChoices" STRING[] DEFAULT ARRAY[]::STRING[],
    "discoverdFrom" STRING[] DEFAULT ARRAY[]::STRING[],
    "considerCoffee" BOOL NOT NULL,
    "dietaryRestrictions" STRING,
    "underrepresented" "YesNoUnsure" NOT NULL,
    "gender" STRING NOT NULL,
    "race" STRING NOT NULL,
    "orientation" STRING NOT NULL,
    "emergencyContactName" STRING NOT NULL,
    "emergencyContactPhone" STRING NOT NULL,
    "emergencyContactRelation" STRING NOT NULL,
    "agreeToMLHCodeOfConduct" BOOL NOT NULL,
    "agreeToMLHPrivacyPolicy" BOOL NOT NULL,
    "agreeToMLHCommunications" BOOL NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'IN_REVIEW',

    CONSTRAINT "DH11Application_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DH11Review" (
    "id" STRING NOT NULL,
    "score" FLOAT8 NOT NULL,
    "comment" STRING NOT NULL,
    "reviewerId" STRING NOT NULL,
    "applicationId" STRING NOT NULL,

    CONSTRAINT "DH11Review_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_dH11ApplicationId_key" ON "User"("dH11ApplicationId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_dH11ApplicationId_fkey" FOREIGN KEY ("dH11ApplicationId") REFERENCES "DH11Application"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DH11Review" ADD CONSTRAINT "DH11Review_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "DH11Application"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DH11Review" ADD CONSTRAINT "DH11Review_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
