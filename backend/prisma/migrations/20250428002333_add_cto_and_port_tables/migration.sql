-- CreateTable
CREATE TABLE "ctos" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "capacity" INTEGER NOT NULL,
    "address" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ctos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ports" (
    "id" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'available',
    "clientName" TEXT,
    "clientId" TEXT,
    "ctoId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ports_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ports" ADD CONSTRAINT "ports_ctoId_fkey" FOREIGN KEY ("ctoId") REFERENCES "ctos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
