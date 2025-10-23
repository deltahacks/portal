-- AlterTable
ALTER TABLE "DH11Application" ALTER COLUMN "underrepresented" DROP NOT NULL;

-- AlterTable
ALTER TABLE "DH12Application" ALTER COLUMN "underrepresented" DROP NOT NULL;
ALTER TABLE "DH12Application" ALTER COLUMN "gender" DROP NOT NULL;
ALTER TABLE "DH12Application" ALTER COLUMN "race" DROP NOT NULL;
ALTER TABLE "DH12Application" ALTER COLUMN "orientation" DROP NOT NULL;
