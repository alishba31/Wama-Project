-- CreateTable
CREATE TABLE "ProductSpecificReport" (
    "id" SERIAL NOT NULL,
    "productName" TEXT NOT NULL,
    "productCategory" TEXT NOT NULL,
    "serialNumber" TEXT NOT NULL,
    "modelNumber" TEXT NOT NULL,
    "manufacturerName" TEXT NOT NULL,
    "warrantyStartDate" TIMESTAMP(3) NOT NULL,
    "warrantyEndDate" TIMESTAMP(3) NOT NULL,
    "ticketId" INTEGER NOT NULL,
    "ticketDate" TIMESTAMP(3) NOT NULL,
    "adminStatus" TEXT NOT NULL,
    "oemStatus" TEXT NOT NULL,
    "ticketType" TEXT NOT NULL,
    "claimDescription" TEXT NOT NULL,
    "causeOfFailure" TEXT NOT NULL,
    "adminComments" TEXT,
    "oemComments" TEXT,

    CONSTRAINT "ProductSpecificReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProductSpecificReport_ticketId_key" ON "ProductSpecificReport"("ticketId");

-- CreateIndex
CREATE INDEX "ProductSpecificReport_ticketId_idx" ON "ProductSpecificReport"("ticketId");

-- AddForeignKey
ALTER TABLE "ProductSpecificReport" ADD CONSTRAINT "ProductSpecificReport_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "TroubleTicket"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
