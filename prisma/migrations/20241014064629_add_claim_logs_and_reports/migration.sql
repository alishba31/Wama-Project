/*
  Warnings:

  - You are about to drop the column `claimCount` on the `Report` table. All the data in the column will be lost.
  - You are about to drop the column `claimsByStatus` on the `Report` table. All the data in the column will be lost.
  - You are about to drop the column `generatedAt` on the `Report` table. All the data in the column will be lost.
  - You are about to drop the column `userCount` on the `Report` table. All the data in the column will be lost.
  - You are about to drop the column `roleId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `WarrantyClaim` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `WarrantyClaim` table. All the data in the column will be lost.
  - You are about to drop the `Role` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[serialNumber]` on the table `WarrantyClaim` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `data` to the `Report` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reportType` to the `Report` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Report` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_roleId_fkey";

-- AlterTable
ALTER TABLE "Report" DROP COLUMN "claimCount",
DROP COLUMN "claimsByStatus",
DROP COLUMN "generatedAt",
DROP COLUMN "userCount",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "data" JSONB NOT NULL,
ADD COLUMN     "reportType" TEXT NOT NULL,
ADD COLUMN     "userId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "roleId",
ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'USER';

-- AlterTable
ALTER TABLE "WarrantyClaim" DROP COLUMN "createdAt",
DROP COLUMN "title",
ADD COLUMN     "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "status" SET DEFAULT 'PENDING';

-- DropTable
DROP TABLE "Role";

-- CreateIndex
CREATE UNIQUE INDEX "WarrantyClaim_serialNumber_key" ON "WarrantyClaim"("serialNumber");

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
