import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const slaRecords = await prisma.sLARecord.findMany({
      where: {
        TroubleTicket: {
          escalationLevel: { in: [1, 2] },  // Only fetch SLAs with escalation level 1 and 2
        },
      },
      include: {
        TroubleTicket: true, // Include related trouble ticket info
      },
      
    });

    return NextResponse.json(slaRecords);
  } catch (error) {
    console.error("Error fetching SLA records:", error);
    return NextResponse.json({ error: "Failed to fetch SLA records" }, { status: 500 });
  }
}
