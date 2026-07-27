/*
  Warnings:

  - A unique constraint covering the columns `[DH13ApplicationId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "DH13ApplicationId" STRING;

-- CreateTable
CREATE TABLE "DH13Application" (
    "id" STRING NOT NULL,
    "firstName" STRING NOT NULL,
    "lastName" STRING NOT NULL,
    "phone" STRING,
    "country" STRING,
    "birthday" TIMESTAMP(3) NOT NULL,
    "studyEnrolledPostSecondary" BOOL NOT NULL,
    "studyLocation" STRING,
    "studyDegree" STRING,
    "studyMajor" STRING,
    "studyYearOfStudy" STRING,
    "studyExpectedGraduation" TIMESTAMP(3),
    "previousHackathonsCount" INT4 NOT NULL,
    "longAnswerPerspective" STRING NOT NULL,
    "longAnswerUnexpectedSkill" STRING NOT NULL,
    "longAnswerFutureSelf" STRING NOT NULL,
    "longAnswerDayWith" STRING,
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
    "underrepresented" "YesNoUnsure",
    "gender" STRING,
    "race" STRING,
    "orientation" STRING,
    "emergencyContactName" STRING NOT NULL,
    "emergencyContactPhone" STRING NOT NULL,
    "emergencyContactRelation" STRING NOT NULL,
    "agreeToMLHCodeOfConduct" BOOL NOT NULL,
    "agreeToMLHPrivacyPolicy" BOOL NOT NULL,
    "agreeToMLHCommunications" BOOL NOT NULL,
    "rsvpCheck" BOOL NOT NULL DEFAULT false,
    "status" "Status" NOT NULL DEFAULT 'IN_REVIEW',

    CONSTRAINT "DH13Application_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DH13Review" (
    "id" STRING NOT NULL,
    "score" FLOAT8 NOT NULL,
    "comment" STRING NOT NULL,
    "reviewerId" STRING NOT NULL,
    "applicationId" STRING NOT NULL,

    CONSTRAINT "DH13Review_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_DH13ApplicationId_key" ON "User"("DH13ApplicationId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_DH13ApplicationId_fkey" FOREIGN KEY ("DH13ApplicationId") REFERENCES "DH13Application"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DH13Review" ADD CONSTRAINT "DH13Review_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "DH13Application"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DH13Review" ADD CONSTRAINT "DH13Review_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
