/*
  Warnings:

  - You are about to drop the column `address` on the `olts` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `olts` table. All the data in the column will be lost.
  - You are about to drop the column `total_ports` on the `olts` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `olts` table. All the data in the column will be lost.
  - You are about to drop the `cto_ports` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `olt_ports` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `brand` to the `olts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `olts` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "cto_ports" DROP CONSTRAINT "cto_ports_ctoId_fkey";

-- DropForeignKey
ALTER TABLE "olt_ports" DROP CONSTRAINT "olt_ports_olt_id_fkey";

-- DropIndex
DROP INDEX "olts_name_key";

-- AlterTable
ALTER TABLE "olts" DROP COLUMN "address",
DROP COLUMN "created_at",
DROP COLUMN "total_ports",
DROP COLUMN "updated_at",
ADD COLUMN     "brand" TEXT NOT NULL DEFAULT 'Desconhecido',
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "ip" TEXT,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "ports" INTEGER NOT NULL DEFAULT 16,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'active',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- DropTable
DROP TABLE "cto_ports";

-- DropTable
DROP TABLE "olt_ports";

-- CreateTable
CREATE TABLE "ports" (
    "id" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'available',
    "clientName" TEXT,
    "clientId" TEXT,
    "ctoId" TEXT,
    "oltId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ports_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ports" ADD CONSTRAINT "ports_ctoId_fkey" FOREIGN KEY ("ctoId") REFERENCES "ctos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ports" ADD CONSTRAINT "ports_oltId_fkey" FOREIGN KEY ("oltId") REFERENCES "olts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
