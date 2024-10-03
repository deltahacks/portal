-- CreateTable
CREATE TABLE "FormSubmission" (
    "submissionTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "Status" NOT NULL DEFAULT 'IN_REVIEW',
    "formStructureId" STRING NOT NULL,
    "submitterId" STRING NOT NULL,

    CONSTRAINT "FormSubmission_pkey" PRIMARY KEY ("formStructureId","submitterId")
);

-- CreateTable
CREATE TABLE "FormStructure" (
    "id" STRING NOT NULL,

    CONSTRAINT "FormStructure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionCategory" (
    "id" STRING NOT NULL,
    "name" STRING NOT NULL,
    "formStructureId" STRING NOT NULL,

    CONSTRAINT "QuestionCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Question" (
    "id" STRING NOT NULL,
    "statement" STRING NOT NULL,
    "displayPriority" INT4 NOT NULL,
    "formStructureId" STRING NOT NULL,
    "categoryId" STRING NOT NULL,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Answer" (
    "statement" STRING,
    "addressedQuestionId" STRING NOT NULL,
    "submitterId" STRING NOT NULL,

    CONSTRAINT "Answer_pkey" PRIMARY KEY ("addressedQuestionId","submitterId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Question_displayPriority_formStructureId_key" ON "Question"("displayPriority", "formStructureId");

-- AddForeignKey
ALTER TABLE "FormSubmission" ADD CONSTRAINT "FormSubmission_formStructureId_fkey" FOREIGN KEY ("formStructureId") REFERENCES "FormStructure"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormSubmission" ADD CONSTRAINT "FormSubmission_submitterId_fkey" FOREIGN KEY ("submitterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionCategory" ADD CONSTRAINT "QuestionCategory_formStructureId_fkey" FOREIGN KEY ("formStructureId") REFERENCES "FormStructure"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_formStructureId_fkey" FOREIGN KEY ("formStructureId") REFERENCES "FormStructure"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "QuestionCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_addressedQuestionId_fkey" FOREIGN KEY ("addressedQuestionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_submitterId_fkey" FOREIGN KEY ("submitterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
