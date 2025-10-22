/*
  Warnings:

  - A unique constraint covering the columns `[DH12ApplicationId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "DH12ApplicationId" STRING;

-- CreateTable
CREATE TABLE "DH12Application" (
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
    "longAnswerHobby" STRING NOT NULL,
    "longAnswerWhy" STRING NOT NULL,
    "longAnswerTime" STRING NOT NULL,
    "longAnswerSkill" STRING NOT NULL,
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
    "rsvpCheck" BOOL NOT NULL DEFAULT false,
    "status" "Status" NOT NULL DEFAULT 'IN_REVIEW',

    CONSTRAINT "DH12Application_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DH12Review" (
    "id" STRING NOT NULL,
    "score" FLOAT8 NOT NULL,
    "comment" STRING NOT NULL,
    "reviewerId" STRING NOT NULL,
    "applicationId" STRING NOT NULL,

    CONSTRAINT "DH12Review_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_DH12ApplicationId_key" ON "User"("DH12ApplicationId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_DH12ApplicationId_fkey" FOREIGN KEY ("DH12ApplicationId") REFERENCES "DH12Application"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DH12Review" ADD CONSTRAINT "DH12Review_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "DH12Application"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DH12Review" ADD CONSTRAINT "DH12Review_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
