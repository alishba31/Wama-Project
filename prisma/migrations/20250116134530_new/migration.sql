/*
  Warnings:

  - You are about to drop the column `claimId` on the `Feedback` table. All the data in the column will be lost.
  - Added the required column `troubleTicketId` to the `Feedback` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Feedback" DROP CONSTRAINT "Feedback_claimId_fkey";

-- DropIndex
DROP INDEX "Feedback_claimId_idx";

-- AlterTable
ALTER TABLE "Feedback" DROP COLUMN "claimId",
ADD COLUMN     "troubleTicketId" INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX "Feedback_troubleTicketId_idx" ON "Feedback"("troubleTicketId");

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_troubleTicketId_fkey" FOREIGN KEY ("troubleTicketId") REFERENCES "TroubleTicket"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
