-- CreateSequence
CREATE SEQUENCE "DH13Application_applicationNumber_seq" MINVALUE 1 START 1;

-- AlterTable
ALTER TABLE "DH13Application" ADD COLUMN     "applicationNumber" INT4 NOT NULL DEFAULT nextval('"DH13Application_applicationNumber_seq"');

-- CreateIndex
CREATE UNIQUE INDEX "DH13Application_applicationNumber_key" ON "DH13Application"("applicationNumber");
