-- CreateTable
CREATE TABLE "FormSubmission" (
    "id" STRING NOT NULL,
    "lastUpdated" TIMESTAMP(3) NOT NULL,
    "isSubmitted" BOOL NOT NULL,
    "formYear" INT4 NOT NULL,
    "submitterID" STRING,

    CONSTRAINT "FormSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormStructureQuestion" (
    "displayPriority" INT4 NOT NULL,
    "formYear" INT4 NOT NULL,
    "questionId" STRING NOT NULL,

    CONSTRAINT "FormStructureQuestion_pkey" PRIMARY KEY ("formYear","questionId")
);

-- CreateTable
CREATE TABLE "FormStructure" (
    "year" INT4 NOT NULL,

    CONSTRAINT "FormStructure_pkey" PRIMARY KEY ("year")
);

-- CreateTable
CREATE TABLE "Answer" (
    "id" STRING NOT NULL,
    "statement" STRING NOT NULL,
    "questionId" STRING NOT NULL,
    "submissionId" STRING NOT NULL,

    CONSTRAINT "Answer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Question" (
    "id" STRING NOT NULL,
    "statement" STRING NOT NULL,
    "categoryId" STRING NOT NULL,
    "answerTypeId" STRING NOT NULL,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnswerType" (
    "name" STRING NOT NULL,
    "validElements" JSONB,

    CONSTRAINT "AnswerType_pkey" PRIMARY KEY ("name")
);

-- CreateTable
CREATE TABLE "QuestionCategory" (
    "name" STRING NOT NULL,

    CONSTRAINT "QuestionCategory_pkey" PRIMARY KEY ("name")
);

-- AddForeignKey
ALTER TABLE "FormSubmission" ADD CONSTRAINT "FormSubmission_formYear_fkey" FOREIGN KEY ("formYear") REFERENCES "FormStructure"("year") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormSubmission" ADD CONSTRAINT "FormSubmission_submitterID_fkey" FOREIGN KEY ("submitterID") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormStructureQuestion" ADD CONSTRAINT "FormStructureQuestion_formYear_fkey" FOREIGN KEY ("formYear") REFERENCES "FormStructure"("year") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormStructureQuestion" ADD CONSTRAINT "FormStructureQuestion_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "FormSubmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "QuestionCategory"("name") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_answerTypeId_fkey" FOREIGN KEY ("answerTypeId") REFERENCES "AnswerType"("name") ON DELETE CASCADE ON UPDATE CASCADE;
