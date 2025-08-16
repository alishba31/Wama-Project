-- CreateTable
CREATE TABLE "WarrantyData" (
    "id" SERIAL NOT NULL,
    "productType" TEXT NOT NULL,
    "serialNumber" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    "warrantySpan" TEXT NOT NULL,
    "dateOfPurchase" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WarrantyData_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WarrantyData_serialNumber_key" ON "WarrantyData"("serialNumber");
