/*
  Warnings:

  - You are about to drop the column `appPerformanceRating` on the `ServiceReporting` table. All the data in the column will be lost.
  - You are about to drop the column `totalSLAsBreached` on the `ServiceReporting` table. All the data in the column will be lost.
  - You are about to drop the column `totalSolvedTickets` on the `ServiceReporting` table. All the data in the column will be lost.
  - You are about to drop the column `totalUnsolvedTickets` on the `ServiceReporting` table. All the data in the column will be lost.
  - You are about to drop the column `unsolvedReasons` on the `ServiceReporting` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ServiceReporting" DROP COLUMN "appPerformanceRating",
DROP COLUMN "totalSLAsBreached",
DROP COLUMN "totalSolvedTickets",
DROP COLUMN "totalUnsolvedTickets",
DROP COLUMN "unsolvedReasons";
