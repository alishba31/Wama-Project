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

// GET Level 2 Trouble Ticket Summary Stats
export async function GET(req: NextRequest) {
    try {
      const [totalLevel2, solvedLevel2, pendingLevel2, inProgressLevel2] = await Promise.all([
        prisma.troubleTicket.count({
          where: { escalationLevel: 2 },
        }),
  
        prisma.troubleTicket.count({
          where: { 
            AND: [
              { escalationLevel: 2 },
              { oemStatus: "COMPLETED" }
            ]
          },
        }),
  
        prisma.troubleTicket.count({
          where: {
            AND: [
              { escalationLevel: 2 },
              { oemStatus: "PENDING" }
            ]
          },
        }),
  
        prisma.troubleTicket.count({
          where: {
            AND: [
              { escalationLevel: 2 },
              { oemStatus: "IN_PROGRESS" }
            ]
          },
        }),
      ]);
  
      return NextResponse.json({
        totalLevel2Tickets: totalLevel2,
        solvedLevel2Tickets: solvedLevel2,
        pendingLevel2Tickets: pendingLevel2,
        inProgressLevel2Tickets: inProgressLevel2,
      }, { status: 200 });
  
    } catch (error) {
      console.error("Error fetching level 2 ticket summary:", error);
      return NextResponse.json({ message: "Error fetching level 2 ticket summary" }, { status: 500 });
    }
  }