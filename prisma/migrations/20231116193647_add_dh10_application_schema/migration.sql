/*
  Warnings:

  - A unique constraint covering the columns `[dH10ApplicationId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "dH10ApplicationId" STRING;

-- CreateTable
CREATE TABLE "DH10Application" (
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
    "longAnswerChange" STRING NOT NULL,
    "longAnswerExperience" STRING NOT NULL,
    "longAnswerTech" STRING NOT NULL,
    "longAnswerMagic" STRING NOT NULL,
    "socialText" STRING,
    "interests" STRING,
    "linkToResume" STRING,
    "tshirtSize" STRING NOT NULL,
    "hackerKind" STRING NOT NULL,
    "alreadyHaveTeam" BOOL NOT NULL,
    "workshopChoices" STRING[],
    "discoverdFrom" STRING[],
    "considerCoffee" BOOL NOT NULL,
    "gender" STRING NOT NULL,
    "race" STRING NOT NULL,
    "emergencyContactName" STRING NOT NULL,
    "emergencyContactPhone" STRING NOT NULL,
    "emergencyContactRelation" STRING NOT NULL,
    "agreeToMLHCodeOfConduct" BOOL NOT NULL,
    "agreeToMLHPrivacyPolicy" BOOL NOT NULL,
    "agreeToMLHCommunications" BOOL NOT NULL,

    CONSTRAINT "DH10Application_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_dH10ApplicationId_key" ON "User"("dH10ApplicationId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_dH10ApplicationId_fkey" FOREIGN KEY ("dH10ApplicationId") REFERENCES "DH10Application"("id") ON DELETE SET NULL ON UPDATE CASCADE;
