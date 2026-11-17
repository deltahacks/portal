ALTER TABLE "Station" SET (schema_locked = false);
ALTER TABLE "EquipmentLog" SET (schema_locked = false);

DROP INDEX "Station_name_option_key";

ALTER TABLE "Station" ADD COLUMN "dhYear" STRING;
UPDATE "Station" SET "dhYear" = 'DH12' WHERE "dhYear" IS NULL;
ALTER TABLE "Station" ALTER COLUMN "dhYear" SET NOT NULL;

ALTER TABLE "EquipmentLog" ADD COLUMN "dhYear" STRING;
UPDATE "EquipmentLog" SET "dhYear" = 'DH12' WHERE "dhYear" IS NULL;
ALTER TABLE "EquipmentLog" ALTER COLUMN "dhYear" SET NOT NULL;

CREATE UNIQUE INDEX "Station_name_option_dhYear_key" ON "Station"("name", "option", "dhYear");

ALTER TABLE "Station" SET (schema_locked = true);
ALTER TABLE "EquipmentLog" SET (schema_locked = true);
