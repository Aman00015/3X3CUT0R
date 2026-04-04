/*
  Warnings:

  - You are about to drop the `WorkFlow` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "WorkFlow";

-- CreateTable
CREATE TABLE "Workflow" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Workflow_pkey" PRIMARY KEY ("id")
);
