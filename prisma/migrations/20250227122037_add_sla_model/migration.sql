-- CreateTable
CREATE TABLE "SLARecord" (
    "id" SERIAL NOT NULL,
    "ticketId" INTEGER NOT NULL,
    "slaStatus" TEXT NOT NULL DEFAULT 'ACTIVE',
    "breachDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SLARecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SLARecord_ticketId_key" ON "SLARecord"("ticketId");

-- CreateIndex
CREATE INDEX "SLARecord_ticketId_idx" ON "SLARecord"("ticketId");

-- AddForeignKey
ALTER TABLE "SLARecord" ADD CONSTRAINT "SLARecord_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "TroubleTicket"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
