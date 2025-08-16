/*
  Warnings:

  - Added the required column `slaEndTime` to the `SLARecord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slaStartTime` to the `SLARecord` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SLARecord" ADD COLUMN     "slaEndTime" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "slaStartTime" TIMESTAMP(3) NOT NULL;
