-- CreateEnum
CREATE TYPE "Role" AS ENUM ('HACKER', 'ADMIN', 'REVIEWER', 'FOOD_MANAGER', 'EVENT_MANAGER', 'GENERAL_SCANNER', 'SPONSER', 'JUDGE');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('IN_REVIEW', 'REJECTED', 'WAITLISTED', 'ACCEPTED', 'RSVP', 'CHECKED_IN');

-- CreateEnum
CREATE TYPE "YesNoUnsure" AS ENUM ('YES', 'NO', 'UNSURE');

-- CreateEnum
CREATE TYPE "FieldType" AS ENUM ('text', 'textarea', 'number', 'select', 'multiselect', 'checkbox', 'date', 'email', 'url');

-- CreateTable
CREATE TABLE "Account" (
    "id" STRING NOT NULL,
    "userId" STRING NOT NULL,
    "type" STRING NOT NULL,
    "provider" STRING NOT NULL,
    "providerAccountId" STRING NOT NULL,
    "refresh_token" STRING,
    "refresh_token_expires_in" INT4,
    "access_token" STRING,
    "expires_at" INT4,
    "ext_expires_in" INT4,
    "oauth_token_secret" STRING,
    "oauth_token" STRING,
    "token_type" STRING,
    "scope" STRING,
    "id_token" STRING,
    "session_state" STRING,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" STRING NOT NULL,
    "sessionToken" STRING NOT NULL,
    "userId" STRING NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" STRING NOT NULL,
    "name" STRING,
    "email" STRING,
    "emailVerified" TIMESTAMP(3),
    "image" STRING,
    "typeform_response_id" STRING,
    "role" "Role"[] DEFAULT ARRAY['HACKER']::"Role"[],
    "status" "Status" NOT NULL DEFAULT 'IN_REVIEW',
    "qrcode" INT4,
    "mealsTaken" INT4 NOT NULL DEFAULT 0,
    "lastMealTaken" TIMESTAMP(3),
    "dH10ApplicationId" STRING,
    "DH11ApplicationId" STRING,
    "DH12ApplicationId" STRING,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" STRING NOT NULL,
    "hackerId" STRING NOT NULL,
    "reviewerId" STRING NOT NULL,
    "mark" FLOAT8 NOT NULL DEFAULT 0,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventLog" (
    "id" STRING NOT NULL,
    "userId" STRING NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "event" STRING NOT NULL,

    CONSTRAINT "EventLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" STRING NOT NULL,
    "token" STRING NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

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
    "macEv" BOOL NOT NULL DEFAULT false,
    "emergencyContactName" STRING NOT NULL,
    "emergencyContactPhone" STRING NOT NULL,
    "emergencyContactRelation" STRING NOT NULL,
    "agreeToMLHCodeOfConduct" BOOL NOT NULL,
    "agreeToMLHPrivacyPolicy" BOOL NOT NULL,
    "agreeToMLHCommunications" BOOL NOT NULL,

    CONSTRAINT "DH10Application_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Config" (
    "id" STRING NOT NULL,
    "name" STRING NOT NULL,
    "value" STRING NOT NULL,

    CONSTRAINT "Config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DH11Application" (
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
    "underrepresented" "YesNoUnsure",
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

    CONSTRAINT "DH11Application_pkey" PRIMARY KEY ("id")
);

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

    CONSTRAINT "DH12Application_pkey" PRIMARY KEY ("id")
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

-- CreateTable
CREATE TABLE "DH12Review" (
    "id" STRING NOT NULL,
    "score" FLOAT8 NOT NULL,
    "comment" STRING NOT NULL,
    "reviewerId" STRING NOT NULL,
    "applicationId" STRING NOT NULL,

    CONSTRAINT "DH12Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApplicationSchema" (
    "id" STRING NOT NULL,
    "name" STRING NOT NULL,
    "dhYear" STRING NOT NULL,
    "description" STRING,
    "isPublished" BOOL NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" STRING,

    CONSTRAINT "ApplicationSchema_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApplicationField" (
    "id" STRING NOT NULL,
    "label" STRING NOT NULL,
    "type" "FieldType" NOT NULL,
    "required" BOOL NOT NULL DEFAULT false,
    "placeholder" STRING,
    "helpText" STRING,
    "options" STRING[] DEFAULT ARRAY[]::STRING[],
    "validation" JSONB,
    "order" INT4 NOT NULL DEFAULT 0,
    "schemaId" STRING NOT NULL,

    CONSTRAINT "ApplicationField_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApplicationResponse" (
    "id" STRING NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'IN_REVIEW',
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" STRING NOT NULL,
    "schemaId" STRING NOT NULL,

    CONSTRAINT "ApplicationResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApplicationFieldResponse" (
    "id" STRING NOT NULL,
    "value" STRING NOT NULL DEFAULT '',
    "responseId" STRING NOT NULL,
    "fieldId" STRING NOT NULL,

    CONSTRAINT "ApplicationFieldResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RubricTemplate" (
    "id" STRING NOT NULL,
    "name" STRING NOT NULL,
    "description" STRING,
    "dhYear" STRING NOT NULL,
    "published" BOOL NOT NULL DEFAULT false,
    "isActive" BOOL NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RubricTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RubricCriterion" (
    "id" STRING NOT NULL,
    "templateId" STRING NOT NULL,
    "title" STRING NOT NULL,
    "description" STRING NOT NULL,
    "maxPoints" INT4 NOT NULL DEFAULT 10,
    "order" INT4 NOT NULL DEFAULT 0,
    "category" STRING,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RubricCriterion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApplicationGrade" (
    "id" STRING NOT NULL,
    "responseId" STRING NOT NULL,
    "reviewerId" STRING NOT NULL,
    "score" FLOAT8 NOT NULL,
    "feedback" STRING,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApplicationGrade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CriterionGrade" (
    "id" STRING NOT NULL,
    "gradeId" STRING NOT NULL,
    "criterionId" STRING NOT NULL,
    "score" INT4 NOT NULL,
    "comment" STRING,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CriterionGrade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectTrack" (
    "id" STRING NOT NULL,
    "projectId" STRING NOT NULL,
    "trackId" STRING NOT NULL,

    CONSTRAINT "ProjectTrack_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Track" (
    "id" STRING NOT NULL,
    "name" STRING NOT NULL,

    CONSTRAINT "Track_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Table" (
    "id" STRING NOT NULL,
    "number" INT4 NOT NULL,
    "trackId" STRING NOT NULL,

    CONSTRAINT "Table_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" STRING NOT NULL,
    "name" STRING NOT NULL,
    "description" STRING NOT NULL,
    "link" STRING NOT NULL,
    "dhYear" STRING NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimeSlot" (
    "id" STRING NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "projectId" STRING NOT NULL,
    "tableId" STRING NOT NULL,
    "dhYear" STRING NOT NULL,

    CONSTRAINT "TimeSlot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JudgingResult" (
    "id" STRING NOT NULL,
    "judgeId" STRING NOT NULL,
    "projectId" STRING NOT NULL,
    "dhYear" STRING NOT NULL,
    "tableId" STRING NOT NULL,

    CONSTRAINT "JudgingResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RubricQuestion" (
    "id" STRING NOT NULL,
    "title" STRING NOT NULL,
    "question" STRING NOT NULL,
    "points" INT4 NOT NULL,
    "trackId" STRING NOT NULL,

    CONSTRAINT "RubricQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RubricResponse" (
    "id" STRING NOT NULL,
    "score" INT4 NOT NULL,
    "judgingResultId" STRING NOT NULL,
    "questionId" STRING NOT NULL,

    CONSTRAINT "RubricResponse_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_qrcode_key" ON "User"("qrcode");

-- CreateIndex
CREATE UNIQUE INDEX "User_dH10ApplicationId_key" ON "User"("dH10ApplicationId");

-- CreateIndex
CREATE UNIQUE INDEX "User_DH11ApplicationId_key" ON "User"("DH11ApplicationId");

-- CreateIndex
CREATE UNIQUE INDEX "User_DH12ApplicationId_key" ON "User"("DH12ApplicationId");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "Config_name_key" ON "Config"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ApplicationSchema_name_dhYear_key" ON "ApplicationSchema"("name", "dhYear");

-- CreateIndex
CREATE INDEX "ApplicationField_schemaId_idx" ON "ApplicationField"("schemaId");

-- CreateIndex
CREATE INDEX "ApplicationResponse_schemaId_idx" ON "ApplicationResponse"("schemaId");

-- CreateIndex
CREATE UNIQUE INDEX "ApplicationResponse_userId_schemaId_key" ON "ApplicationResponse"("userId", "schemaId");

-- CreateIndex
CREATE INDEX "ApplicationFieldResponse_responseId_idx" ON "ApplicationFieldResponse"("responseId");

-- CreateIndex
CREATE UNIQUE INDEX "ApplicationFieldResponse_responseId_fieldId_key" ON "ApplicationFieldResponse"("responseId", "fieldId");

-- CreateIndex
CREATE UNIQUE INDEX "CriterionGrade_gradeId_criterionId_key" ON "CriterionGrade"("gradeId", "criterionId");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectTrack_projectId_trackId_key" ON "ProjectTrack"("projectId", "trackId");

-- CreateIndex
CREATE UNIQUE INDEX "Track_name_key" ON "Track"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Table_number_key" ON "Table"("number");

-- CreateIndex
CREATE UNIQUE INDEX "TimeSlot_projectId_startTime_key" ON "TimeSlot"("projectId", "startTime");

-- CreateIndex
CREATE UNIQUE INDEX "TimeSlot_tableId_startTime_key" ON "TimeSlot"("tableId", "startTime");

-- CreateIndex
CREATE UNIQUE INDEX "JudgingResult_judgeId_projectId_key" ON "JudgingResult"("judgeId", "projectId");

-- CreateIndex
CREATE UNIQUE INDEX "RubricResponse_judgingResultId_questionId_key" ON "RubricResponse"("judgingResultId", "questionId");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_dH10ApplicationId_fkey" FOREIGN KEY ("dH10ApplicationId") REFERENCES "DH10Application"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_DH11ApplicationId_fkey" FOREIGN KEY ("DH11ApplicationId") REFERENCES "DH11Application"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_DH12ApplicationId_fkey" FOREIGN KEY ("DH12ApplicationId") REFERENCES "DH12Application"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_hackerId_fkey" FOREIGN KEY ("hackerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventLog" ADD CONSTRAINT "EventLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DH11Review" ADD CONSTRAINT "DH11Review_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "DH11Application"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DH11Review" ADD CONSTRAINT "DH11Review_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DH12Review" ADD CONSTRAINT "DH12Review_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "DH12Application"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DH12Review" ADD CONSTRAINT "DH12Review_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicationField" ADD CONSTRAINT "ApplicationField_schemaId_fkey" FOREIGN KEY ("schemaId") REFERENCES "ApplicationSchema"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicationResponse" ADD CONSTRAINT "ApplicationResponse_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicationResponse" ADD CONSTRAINT "ApplicationResponse_schemaId_fkey" FOREIGN KEY ("schemaId") REFERENCES "ApplicationSchema"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicationFieldResponse" ADD CONSTRAINT "ApplicationFieldResponse_responseId_fkey" FOREIGN KEY ("responseId") REFERENCES "ApplicationResponse"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicationFieldResponse" ADD CONSTRAINT "ApplicationFieldResponse_fieldId_fkey" FOREIGN KEY ("fieldId") REFERENCES "ApplicationField"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RubricCriterion" ADD CONSTRAINT "RubricCriterion_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "RubricTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicationGrade" ADD CONSTRAINT "ApplicationGrade_responseId_fkey" FOREIGN KEY ("responseId") REFERENCES "ApplicationResponse"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CriterionGrade" ADD CONSTRAINT "CriterionGrade_gradeId_fkey" FOREIGN KEY ("gradeId") REFERENCES "ApplicationGrade"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectTrack" ADD CONSTRAINT "ProjectTrack_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectTrack" ADD CONSTRAINT "ProjectTrack_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "Track"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Table" ADD CONSTRAINT "Table_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "Track"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeSlot" ADD CONSTRAINT "TimeSlot_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeSlot" ADD CONSTRAINT "TimeSlot_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "Table"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JudgingResult" ADD CONSTRAINT "JudgingResult_judgeId_fkey" FOREIGN KEY ("judgeId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JudgingResult" ADD CONSTRAINT "JudgingResult_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JudgingResult" ADD CONSTRAINT "JudgingResult_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "Table"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RubricQuestion" ADD CONSTRAINT "RubricQuestion_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "Track"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RubricResponse" ADD CONSTRAINT "RubricResponse_judgingResultId_fkey" FOREIGN KEY ("judgingResultId") REFERENCES "JudgingResult"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RubricResponse" ADD CONSTRAINT "RubricResponse_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "RubricQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
