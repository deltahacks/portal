-- CreateTable
CREATE TABLE "Config" (
    "id" STRING NOT NULL,
    "name" STRING NOT NULL,
    "value" STRING NOT NULL,

    CONSTRAINT "Config_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Config_name_key" ON "Config"("name");
