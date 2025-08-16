// app/api/admin/claims/route.ts
import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
let prisma: PrismaClient;

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient();
} else {
  if (!(global as any).prisma) {
    (global as any).prisma = new PrismaClient();
  }
  prisma = (global as any).prisma;
}
// GET method handler (fetch claims)
export async function GET() {
  try {
    // Fetch activity logs with user information
    const logs = await prisma.activityLog.findMany({
      orderBy: {
        timestamp: 'desc',
      },
      include: {
        User: true, // Ensure user data is included
      },
    });
    console.log("Fetched logs:", logs); // Log to check the data

    return NextResponse.json(logs, { status: 200 });
  } catch (error) {
    console.error('Error fetching activity logs:', error);
    return NextResponse.json({ message: 'Error fetching activity logs' }, { status: 500 });
  }
}
// DELETE method handler (delete single or all logs)
export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();

    if (id === "all") {
      // Delete all logs
      await prisma.activityLog.deleteMany();
      return NextResponse.json({ message: "All logs deleted successfully" }, { status: 200 });
    }

    // Validate single log ID
    if (!id) {
      return NextResponse.json({ message: "Log ID is required for deletion" }, { status: 400 });
    }

    await prisma.activityLog.delete({
      where: {
        id: parseInt(id, 10),
      },
    });

    return NextResponse.json({ message: "Log deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting log:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}