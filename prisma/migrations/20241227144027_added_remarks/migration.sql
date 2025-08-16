/*
  Warnings:

  - You are about to drop the column `adminRemarks` on the `TroubleTicket` table. All the data in the column will be lost.
  - You are about to drop the column `oemRemarks` on the `TroubleTicket` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "TroubleTicket" DROP COLUMN "adminRemarks",
DROP COLUMN "oemRemarks",
ADD COLUMN     "remarks" TEXT NOT NULL DEFAULT '';
