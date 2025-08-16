/*
  Warnings:

  - You are about to drop the column `status` on the `TroubleTicket` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "TroubleTicket" DROP COLUMN "status",
ADD COLUMN     "adminStatus" TEXT NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "oemStatus" TEXT NOT NULL DEFAULT 'PENDING';
