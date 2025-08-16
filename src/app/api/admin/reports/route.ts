import { PrismaClient } from "@prisma/client";
import { NextResponse, NextRequest } from "next/server";
import jwt from 'jsonwebtoken';

let prisma: PrismaClient;

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient();
} else {
  if (!(global as any).prisma) {
    (global as any).prisma = new PrismaClient();
  }
  prisma = (global as any).prisma;
}

// Export the POST method handler (create a report)
export async function POST(request: NextRequest) {
  try {
    const { reportType, data } = await request.json();

    // Basic validation check
    if (!reportType || !data) {
      return NextResponse.json({ message: "Report type and data are required" }, { status: 400 });
    }

    // Verify user token
    const tokenCookie = request.cookies.get('token');
    if (!tokenCookie) {
      return NextResponse.json({ message: "Authentication required" }, { status: 401 });
    }
    const token = tokenCookie.value;
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);

    // Create new report
    const report = await prisma.report.create({
      data: {
        reportType,
        data,
        userId: (decoded as any).userId,
      },
    });

    return NextResponse.json({ message: "Report generated successfully", report }, { status: 201 });
  } catch (error) {
    console.error("Error generating report:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// Export the GET method handler (list reports)
export async function GET() {
  try {
    const reports = await prisma.report.findMany();
    return NextResponse.json(reports, { status: 200 });
  } catch (error) {
    console.error("Error fetching reports:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
