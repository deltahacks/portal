-- Add isActive field to ApplicationSchema
ALTER TABLE "ApplicationSchema" ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;
