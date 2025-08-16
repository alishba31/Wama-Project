/*
  Warnings:

  - You are about to drop the column `serialNumber` on the `ProductSpecificReport` table. All the data in the column will be lost.
  - You are about to drop the column `warrantyEndDate` on the `ProductSpecificReport` table. All the data in the column will be lost.
  - You are about to drop the column `warrantyStartDate` on the `ProductSpecificReport` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "ProductSpecificReport_ticketId_key";

-- AlterTable
ALTER TABLE "ProductSpecificReport" DROP COLUMN "serialNumber",
DROP COLUMN "warrantyEndDate",
DROP COLUMN "warrantyStartDate";
