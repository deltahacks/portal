-- CreateTable
CREATE TABLE "FormSubmission" (
    "submissionTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "Status" NOT NULL DEFAULT 'IN_REVIEW',
    "formStructureId" STRING NOT NULL,
    "submitterId" STRING NOT NULL,

    CONSTRAINT "FormSubmission_pkey" PRIMARY KEY ("formStructureId","submitterId")
);

-- CreateTable
CREATE TABLE "FormStructureQuestion" (
    "formStructureId" STRING NOT NULL,
    "questionId" STRING NOT NULL,
    "displayPriority" INT4 NOT NULL,
    "categoryId" STRING NOT NULL,

    CONSTRAINT "FormStructureQuestion_pkey" PRIMARY KEY ("formStructureId","questionId")
);

-- CreateTable
CREATE TABLE "FormStructure" (
    "id" STRING NOT NULL,

    CONSTRAINT "FormStructure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Answer" (
    "statement" STRING,
    "addressedQuestionId" STRING NOT NULL,
    "submitterId" STRING NOT NULL,

    CONSTRAINT "Answer_pkey" PRIMARY KEY ("addressedQuestionId","submitterId")
);

-- CreateTable
CREATE TABLE "Question" (
    "id" STRING NOT NULL,
    "statement" STRING NOT NULL,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormQuestionCategory" (
    "name" STRING NOT NULL,

    CONSTRAINT "FormQuestionCategory_pkey" PRIMARY KEY ("name")
);

-- CreateIndex
CREATE UNIQUE INDEX "FormStructureQuestion_displayPriority_formStructureId_key" ON "FormStructureQuestion"("displayPriority", "formStructureId");

-- AddForeignKey
ALTER TABLE "FormSubmission" ADD CONSTRAINT "FormSubmission_formStructureId_fkey" FOREIGN KEY ("formStructureId") REFERENCES "FormStructure"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormSubmission" ADD CONSTRAINT "FormSubmission_submitterId_fkey" FOREIGN KEY ("submitterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormStructureQuestion" ADD CONSTRAINT "FormStructureQuestion_formStructureId_fkey" FOREIGN KEY ("formStructureId") REFERENCES "FormStructure"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormStructureQuestion" ADD CONSTRAINT "FormStructureQuestion_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormStructureQuestion" ADD CONSTRAINT "FormStructureQuestion_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "FormQuestionCategory"("name") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_addressedQuestionId_fkey" FOREIGN KEY ("addressedQuestionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_submitterId_fkey" FOREIGN KEY ("submitterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
