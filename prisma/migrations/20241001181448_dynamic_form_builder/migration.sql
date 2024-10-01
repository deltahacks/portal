-- CreateTable
CREATE TABLE "FormSubmission" (
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "Status" NOT NULL DEFAULT 'IN_REVIEW',
    "formYear" INT4 NOT NULL,
    "submitterId" STRING NOT NULL,

    CONSTRAINT "FormSubmission_pkey" PRIMARY KEY ("formYear","submitterId")
);

-- CreateTable
CREATE TABLE "FormStructureQuestion" (
    "formYear" INT4 NOT NULL,
    "questionId" STRING NOT NULL,
    "displayPriority" INT4 NOT NULL,
    "categoryId" STRING NOT NULL,

    CONSTRAINT "FormStructureQuestion_pkey" PRIMARY KEY ("formYear","questionId")
);

-- CreateTable
CREATE TABLE "FormStructure" (
    "year" INT4 NOT NULL,

    CONSTRAINT "FormStructure_pkey" PRIMARY KEY ("year")
);

-- CreateTable
CREATE TABLE "Answer" (
    "statement" STRING,
    "addressedQuestionId" STRING NOT NULL,
    "formYear" INT4 NOT NULL,
    "submitterId" STRING NOT NULL,

    CONSTRAINT "Answer_pkey" PRIMARY KEY ("addressedQuestionId","submitterId","formYear")
);

-- CreateTable
CREATE TABLE "Question" (
    "id" STRING NOT NULL,
    "statement" STRING NOT NULL,
    "answerRestrictionId" STRING NOT NULL,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnswerRestriction" (
    "id" STRING NOT NULL,

    CONSTRAINT "AnswerRestriction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormQuestionCategory" (
    "name" STRING NOT NULL,

    CONSTRAINT "FormQuestionCategory_pkey" PRIMARY KEY ("name")
);

-- CreateIndex
CREATE UNIQUE INDEX "FormStructureQuestion_displayPriority_formYear_key" ON "FormStructureQuestion"("displayPriority", "formYear");

-- AddForeignKey
ALTER TABLE "FormSubmission" ADD CONSTRAINT "FormSubmission_formYear_fkey" FOREIGN KEY ("formYear") REFERENCES "FormStructure"("year") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormSubmission" ADD CONSTRAINT "FormSubmission_submitterId_fkey" FOREIGN KEY ("submitterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormStructureQuestion" ADD CONSTRAINT "FormStructureQuestion_formYear_fkey" FOREIGN KEY ("formYear") REFERENCES "FormStructure"("year") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormStructureQuestion" ADD CONSTRAINT "FormStructureQuestion_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormStructureQuestion" ADD CONSTRAINT "FormStructureQuestion_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "FormQuestionCategory"("name") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_addressedQuestionId_fkey" FOREIGN KEY ("addressedQuestionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_formYear_submitterId_fkey" FOREIGN KEY ("formYear", "submitterId") REFERENCES "FormSubmission"("formYear", "submitterId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_answerRestrictionId_fkey" FOREIGN KEY ("answerRestrictionId") REFERENCES "AnswerRestriction"("id") ON DELETE CASCADE ON UPDATE CASCADE;
