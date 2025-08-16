-- CreateTable
CREATE TABLE "ServiceReporting" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "reportType" TEXT NOT NULL,
    "totalSolvedTickets" INTEGER NOT NULL,
    "totalUnsolvedTickets" INTEGER NOT NULL,
    "unsolvedReasons" TEXT[],
    "totalSLAsBreached" INTEGER NOT NULL,
    "appPerformanceRating" INTEGER,
    "extraRemarks" TEXT,
    "filledBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceReporting_pkey" PRIMARY KEY ("id")
);
