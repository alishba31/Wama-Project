import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  const tokenCookie = request.cookies.get("token")?.value;
  if (!tokenCookie) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(tokenCookie, process.env.JWT_SECRET!);
    const userId = (decoded as any).userId;

    const troubleTickets = await prisma.troubleTicket.findMany({
      where: { userId: userId },
      select: {
        id: true,
        title:true,
        formSubmissionId: true,
        adminStatus: true,
        oemStatus:true,
        remarks:true,
        updatedAt: true,
        escalationLevel: true,
        lastEscalatedAt: true,
      },
    });

    return NextResponse.json(troubleTickets, { status: 200 });
  } catch (error) {
    console.error("Error fetching trouble tickets:", error);
    return NextResponse.json(
      { message: "Error fetching trouble tickets" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
