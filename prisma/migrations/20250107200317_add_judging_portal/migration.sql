-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'JUDGE';

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
ALTER TABLE "RubricQuestion" ADD CONSTRAINT "RubricQuestion_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "Track"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RubricResponse" ADD CONSTRAINT "RubricResponse_judgingResultId_fkey" FOREIGN KEY ("judgingResultId") REFERENCES "JudgingResult"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RubricResponse" ADD CONSTRAINT "RubricResponse_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "RubricQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
