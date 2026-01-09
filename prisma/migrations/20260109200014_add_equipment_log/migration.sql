-- CreateEnum
CREATE TYPE "EquipmentType" AS ENUM ('SLEEPING_BAG', 'HARDWARE');

-- CreateEnum
CREATE TYPE "EquipmentAction" AS ENUM ('CHECK_OUT', 'RETURN');

-- CreateTable
CREATE TABLE "EquipmentLog" (
    "id" STRING NOT NULL,
    "userId" STRING NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" "EquipmentType" NOT NULL,
    "action" "EquipmentAction" NOT NULL,
    "adminId" STRING NOT NULL,
    "items" JSONB,
    "notes" STRING,

    CONSTRAINT "EquipmentLog_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "EquipmentLog" ADD CONSTRAINT "EquipmentLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EquipmentLog" ADD CONSTRAINT "EquipmentLog_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
