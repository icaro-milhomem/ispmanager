-- CreateTable
CREATE TABLE "olts" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "ip" TEXT,
    "location" TEXT,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "ports" INTEGER NOT NULL DEFAULT 16,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "olts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fibers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "length" DOUBLE PRECISION NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "oltId" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fibers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "splitters" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "ratio" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "location" TEXT,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "fiberId" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "splitters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coes" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "location" TEXT,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "capacity" INTEGER NOT NULL DEFAULT 12,
    "inputFiberId" TEXT NOT NULL,
    "outputFiberId" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "coes_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "fibers" ADD CONSTRAINT "fibers_oltId_fkey" FOREIGN KEY ("oltId") REFERENCES "olts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "splitters" ADD CONSTRAINT "splitters_fiberId_fkey" FOREIGN KEY ("fiberId") REFERENCES "fibers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coes" ADD CONSTRAINT "coes_inputFiberId_fkey" FOREIGN KEY ("inputFiberId") REFERENCES "fibers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coes" ADD CONSTRAINT "coes_outputFiberId_fkey" FOREIGN KEY ("outputFiberId") REFERENCES "fibers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
