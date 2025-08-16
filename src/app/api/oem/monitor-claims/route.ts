import { PrismaClient } from "@prisma/client";
import { NextResponse, NextRequest } from "next/server";

let prisma: PrismaClient;

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient();
} else {
  if (!(global as any).prisma) {
    (global as any).prisma = new PrismaClient();
  }
  prisma = (global as any).prisma;
}

// Fetch Trouble Tickets (Admin)
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
        SLARecord:{
          select: {
            slaStatus:true
        }
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
  } catch (error) {
    console.error("Error fetching trouble tickets:", error);
    return NextResponse.json({ message: "Error fetching trouble tickets" }, { status: 500 });
  }
}
