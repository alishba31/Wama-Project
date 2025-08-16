import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const tokenCookie = request.cookies.get("token")?.value;
    if (!tokenCookie) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Decode the JWT token
    const decoded = jwt.verify(tokenCookie, process.env.JWT_SECRET!);
    const userId = (decoded as any).userId;

    // Fetch claims where adminStatus or oemStatus is "COMPLETED"
    const claims = await prisma.troubleTicket.findMany({
      where: {
        userId,
        OR: [
          { adminStatus: "COMPLETED" },
          { oemStatus: "COMPLETED" },
        ],
      },
      include: {
        Feedback: true, // Include feedbacks related to the claim
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(claims, { status: 200 });
  } catch (error) {
    console.error("Error fetching claim history:", error);
    return NextResponse.json({ message: "Error fetching claim history" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
