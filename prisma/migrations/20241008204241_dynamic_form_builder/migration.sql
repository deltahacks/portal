-- CreateTable
CREATE TABLE "FormSubmission" (
    "id" STRING NOT NULL,
    "submissionTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "Status" NOT NULL DEFAULT 'IN_REVIEW',
    "formStructureId" STRING NOT NULL,
    "submitterId" STRING NOT NULL,

    CONSTRAINT "FormSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormStructure" (
    "id" STRING NOT NULL,
    "name" STRING NOT NULL,

    CONSTRAINT "FormStructure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormItem" (
    "id" STRING NOT NULL,
    "statement" STRING NOT NULL,
    "formPosition" INT4 NOT NULL,
    "formStructureId" STRING NOT NULL,

    CONSTRAINT "FormItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Question" (
    "formItemId" STRING NOT NULL,
    "placeholder" STRING,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("formItemId")
);

-- CreateTable
CREATE TABLE "Answer" (
    "statement" STRING,
    "addressedQuestionId" STRING NOT NULL,
    "formSubmissionId" STRING NOT NULL,

    CONSTRAINT "Answer_pkey" PRIMARY KEY ("addressedQuestionId","formSubmissionId")
);

-- CreateIndex
CREATE UNIQUE INDEX "FormSubmission_formStructureId_submitterId_key" ON "FormSubmission"("formStructureId", "submitterId");

-- CreateIndex
CREATE UNIQUE INDEX "FormItem_formPosition_formStructureId_key" ON "FormItem"("formPosition", "formStructureId");

-- AddForeignKey
ALTER TABLE "FormSubmission" ADD CONSTRAINT "FormSubmission_formStructureId_fkey" FOREIGN KEY ("formStructureId") REFERENCES "FormStructure"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormSubmission" ADD CONSTRAINT "FormSubmission_submitterId_fkey" FOREIGN KEY ("submitterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormItem" ADD CONSTRAINT "FormItem_formStructureId_fkey" FOREIGN KEY ("formStructureId") REFERENCES "FormStructure"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_formItemId_fkey" FOREIGN KEY ("formItemId") REFERENCES "FormItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_addressedQuestionId_fkey" FOREIGN KEY ("addressedQuestionId") REFERENCES "Question"("formItemId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_formSubmissionId_fkey" FOREIGN KEY ("formSubmissionId") REFERENCES "FormSubmission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
