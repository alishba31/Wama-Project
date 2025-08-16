import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

// GET: Fetch all service reports
export async function GET(request: NextRequest) {
  const tokenCookie = request.cookies.get("token")?.value;

  if (!tokenCookie) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const decodedToken = jwt.verify(tokenCookie, process.env.JWT_SECRET!);
    const userId = (decodedToken as any).userId;

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const reports = await prisma.serviceReporting.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(reports, { status: 200 });
  } catch (error) {
    console.error("Error fetching service reports:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// POST: Create a new service report
export async function POST(request: NextRequest) {
  const tokenCookie = request.cookies.get("token")?.value;

  if (!tokenCookie) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const decodedToken = jwt.verify(tokenCookie, process.env.JWT_SECRET!);
    const userId = (decodedToken as any).userId;

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const {
      title,
      reportType,
      // totalSolvedTickets, // Removed
      // totalUnsolvedTickets, // Removed
      // unsolvedReasons, // Removed
      // totalSLAsBreached, // Removed
      // appPerformanceRating, // Removed
      extraRemarks,
      filledBy,
    } = await request.json();

    // Basic validation
    // Removed checks for:
    // totalSolvedTickets === undefined
    // totalUnsolvedTickets === undefined
    // !unsolvedReasons
    // totalSLAsBreached === undefined
    // appPerformanceRating was not explicitly in this validation block before.
    if (
      !title ||
      !reportType ||
      !filledBy
    ) {
      return NextResponse.json(
        { message: "Required fields missing in request body." },
        { status: 400 }
      );
    }

    // Create the service report
    const newReport = await prisma.serviceReporting.create({
      data: {
        title,
        reportType,
        // totalSolvedTickets, // Removed
        // totalUnsolvedTickets, // Removed
        // unsolvedReasons, // Removed
        // totalSLAsBreached, // Removed
        // appPerformanceRating, // Removed
        extraRemarks, // This can be undefined/null if not provided and schema allows
        filledBy,
      },
    });

    return NextResponse.json(
      { message: "Service report created successfully", newReport },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating service report:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}