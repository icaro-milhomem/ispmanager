/*
  Warnings:

  - You are about to drop the `NetworkIssue` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "NetworkIssue";

-- CreateTable
CREATE TABLE "network_issues" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "affected_customers" TEXT[],
    "created_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved_date" TIMESTAMP(3),
    "resolution" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "network_issues_pkey" PRIMARY KEY ("id")
);
