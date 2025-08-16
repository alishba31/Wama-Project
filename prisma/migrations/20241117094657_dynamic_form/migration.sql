/*
  Warnings:

  - You are about to drop the `WarrantyClaim` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[formSubmissionId]` on the table `TroubleTicket` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `formSubmissionId` to the `Attachment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `formSubmissionId` to the `TroubleTicket` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Feedback" DROP CONSTRAINT "Feedback_claimId_fkey";

-- DropForeignKey
ALTER TABLE "WarrantyClaim" DROP CONSTRAINT "WarrantyClaim_userId_fkey";

-- AlterTable
ALTER TABLE "Attachment" ADD COLUMN     "formSubmissionId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "TroubleTicket" ADD COLUMN     "escalationLevel" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "formSubmissionId" INTEGER NOT NULL,
ADD COLUMN     "lastEscalatedAt" TIMESTAMP(3);

-- DropTable
DROP TABLE "WarrantyClaim";

-- CreateTable
CREATE TABLE "FormDefinition" (
    "id" SERIAL NOT NULL,
    "formName" TEXT NOT NULL,
    "description" TEXT,
    "schema" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FormDefinition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormSubmission" (
    "id" SERIAL NOT NULL,
    "formId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "submittedData" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FormSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TroubleTicketStatusHistory" (
    "id" SERIAL NOT NULL,
    "ticketId" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TroubleTicketStatusHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Escalation" (
    "id" SERIAL NOT NULL,
    "ticketId" INTEGER NOT NULL,
    "escalatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "escalationLevel" INTEGER NOT NULL,

    CONSTRAINT "Escalation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FormSubmission_formId_idx" ON "FormSubmission"("formId");

-- CreateIndex
CREATE INDEX "FormSubmission_userId_idx" ON "FormSubmission"("userId");

-- CreateIndex
CREATE INDEX "TroubleTicketStatusHistory_ticketId_idx" ON "TroubleTicketStatusHistory"("ticketId");

-- CreateIndex
CREATE INDEX "Escalation_ticketId_idx" ON "Escalation"("ticketId");

-- CreateIndex
CREATE INDEX "Attachment_formSubmissionId_idx" ON "Attachment"("formSubmissionId");

-- CreateIndex
CREATE INDEX "Attachment_troubleTicketId_idx" ON "Attachment"("troubleTicketId");

-- CreateIndex
CREATE INDEX "Feedback_claimId_idx" ON "Feedback"("claimId");

-- CreateIndex
CREATE UNIQUE INDEX "TroubleTicket_formSubmissionId_key" ON "TroubleTicket"("formSubmissionId");

-- CreateIndex
CREATE INDEX "TroubleTicket_userId_idx" ON "TroubleTicket"("userId");

-- CreateIndex
CREATE INDEX "TroubleTicket_formSubmissionId_idx" ON "TroubleTicket"("formSubmissionId");

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "FormSubmission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormSubmission" ADD CONSTRAINT "FormSubmission_formId_fkey" FOREIGN KEY ("formId") REFERENCES "FormDefinition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormSubmission" ADD CONSTRAINT "FormSubmission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TroubleTicket" ADD CONSTRAINT "TroubleTicket_formSubmissionId_fkey" FOREIGN KEY ("formSubmissionId") REFERENCES "FormSubmission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_formSubmissionId_fkey" FOREIGN KEY ("formSubmissionId") REFERENCES "FormSubmission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TroubleTicketStatusHistory" ADD CONSTRAINT "TroubleTicketStatusHistory_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "TroubleTicket"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Escalation" ADD CONSTRAINT "Escalation_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "TroubleTicket"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
