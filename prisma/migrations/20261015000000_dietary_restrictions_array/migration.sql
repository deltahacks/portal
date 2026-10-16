-- Preserve all existing free-form responses exactly.  They become a single
-- array item instead of being split or interpreted, which avoids changing an
-- applicant's stated restriction during the migration.
ALTER TABLE "DH13Application"
ADD COLUMN "dietaryRestrictionsNew" STRING[] NOT NULL DEFAULT ARRAY[]::STRING[];

UPDATE "DH13Application"
SET "dietaryRestrictionsNew" = ARRAY["dietaryRestrictions"]
WHERE "dietaryRestrictions" IS NOT NULL AND btrim("dietaryRestrictions") <> '';

ALTER TABLE "DH13Application"
DROP COLUMN "dietaryRestrictions";

ALTER TABLE "DH13Application"
RENAME COLUMN "dietaryRestrictionsNew" TO "dietaryRestrictions";

ALTER TABLE "DH13Application"
ADD COLUMN "dietaryRestrictionOther" STRING;
