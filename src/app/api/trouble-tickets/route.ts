import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Fetch trouble tickets with related details
    const troubleTickets = await prisma.troubleTicket.findMany({
      include: {
        User: {
          select: { name: true, email: true }, // Include user details
        },
        FormSubmission: {
          select: { id: true }, // Include form submission details if necessary
        },
        Escalation: {
          select: {
            escalationLevel: true,
            escalatedAt: true, // Include escalation timestamp
          },
        },
      },
    });

    return NextResponse.json(troubleTickets, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching trouble tickets:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}