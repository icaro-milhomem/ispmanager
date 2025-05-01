/*
  Warnings:

  - You are about to drop the column `brand` on the `olts` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `olts` table. All the data in the column will be lost.
  - You are about to drop the column `ip` on the `olts` table. All the data in the column will be lost.
  - You are about to drop the column `location` on the `olts` table. All the data in the column will be lost.
  - You are about to drop the column `ports` on the `olts` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `olts` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `olts` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name]` on the table `olts` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updated_at` to the `olts` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "olts" DROP COLUMN "brand",
DROP COLUMN "createdAt",
DROP COLUMN "ip",
DROP COLUMN "location",
DROP COLUMN "ports",
DROP COLUMN "status",
DROP COLUMN "updatedAt",
ADD COLUMN     "address" TEXT,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "total_ports" INTEGER NOT NULL DEFAULT 16,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "olt_ports" (
    "id" TEXT NOT NULL,
    "olt_id" TEXT NOT NULL,
    "port_number" INTEGER NOT NULL,
    "max_clients" INTEGER NOT NULL DEFAULT 64,
    "active_clients" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "olt_ports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "olt_ports_olt_id_port_number_key" ON "olt_ports"("olt_id", "port_number");

-- CreateIndex
CREATE UNIQUE INDEX "olts_name_key" ON "olts"("name");

-- AddForeignKey
ALTER TABLE "olt_ports" ADD CONSTRAINT "olt_ports_olt_id_fkey" FOREIGN KEY ("olt_id") REFERENCES "olts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
