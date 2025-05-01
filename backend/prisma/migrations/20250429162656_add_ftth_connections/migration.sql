/*
  Warnings:

  - You are about to drop the `ports` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[name]` on the table `ctos` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "ports" DROP CONSTRAINT "ports_ctoId_fkey";

-- AlterTable
ALTER TABLE "ctos" ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'active',
ALTER COLUMN "capacity" SET DEFAULT 16;

-- DropTable
DROP TABLE "ports";

-- CreateTable
CREATE TABLE "cto_ports" (
    "id" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'available',
    "clientName" TEXT,
    "clientId" TEXT,
    "ctoId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cto_ports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ftth_connections" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "fibers" INTEGER NOT NULL,
    "color" TEXT NOT NULL,
    "coordinates" JSONB NOT NULL,
    "hasSplitter" BOOLEAN NOT NULL DEFAULT false,
    "splitterType" TEXT,
    "splitterRatio" TEXT,
    "splitterLocation" TEXT,
    "sourceId" TEXT,
    "targetId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ftth_connections_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ctos_name_key" ON "ctos"("name");

-- AddForeignKey
ALTER TABLE "cto_ports" ADD CONSTRAINT "cto_ports_ctoId_fkey" FOREIGN KEY ("ctoId") REFERENCES "ctos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ftth_connections" ADD CONSTRAINT "ftth_connections_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "ctos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ftth_connections" ADD CONSTRAINT "ftth_connections_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "ctos"("id") ON DELETE SET NULL ON UPDATE CASCADE;
