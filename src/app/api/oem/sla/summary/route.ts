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

// Get Level 2 SLA summary statistics
export async function GET(req: NextRequest) {
  try {
    // First get all Level 2 trouble tickets
    const level2Tickets = await prisma.troubleTicket.findMany({
      where: { escalationLevel: 2 },
      select: { id: true }
    });
    const level2TicketIds = level2Tickets.map(ticket => ticket.id);

    const [
      totalLevel2SLAs,
      breachedLevel2SLAs,
      activeLevel2SLAs,
      metLevel2SLAs,
      slaTimeline
    ] = await Promise.all([
      // Count only SLAs associated with Level 2 tickets
      prisma.sLARecord.count({
        where: { ticketId: { in: level2TicketIds } }
      }),
      prisma.sLARecord.count({
        where: { 
          ticketId: { in: level2TicketIds },
          slaStatus: "BREACHED" 
        }
      }),
      prisma.sLARecord.count({
        where: { 
          ticketId: { in: level2TicketIds },
          slaStatus: "ACTIVE" 
        }
      }),
      prisma.sLARecord.count({
        where: { 
          ticketId: { in: level2TicketIds },
          slaStatus: "MET" 
        }
      }),
      // Get timeline data for Level 2 tickets only
      prisma.sLARecord.findMany({
        where: { ticketId: { in: level2TicketIds } },
        select: {
          slaStartTime: true,
          slaEndTime: true,
          slaStatus: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        take: 7, // Last 7 days
      }),
    ]);

    // Format timeline data by day
    const timelineByDay: Record<string, { met: number; breached: number; active: number }> = {};
    
    slaTimeline.forEach(sla => {
      const date = new Date(sla.createdAt).toISOString().split('T')[0];
      if (!timelineByDay[date]) {
        timelineByDay[date] = { met: 0, breached: 0, active: 0 };
      }
      
      if (sla.slaStatus === "MET") timelineByDay[date].met++;
      if (sla.slaStatus === "BREACHED") timelineByDay[date].breached++;
      if (sla.slaStatus === "ACTIVE") timelineByDay[date].active++;
    });

    // Convert to array format for chart
    const slaTimelineData = Object.entries(timelineByDay).map(([date, counts]) => ({
      date,
      met: counts.met,
      breached: counts.breached,
      active: counts.active
    })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return NextResponse.json(
      {
        totalSLAs: totalLevel2SLAs,
        breachedSLAs: breachedLevel2SLAs,
        activeSLAs: activeLevel2SLAs,
        metSLAs: metLevel2SLAs,
        slaTimelineData,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching Level 2 SLA summary:", error);
    return NextResponse.json(
      { message: "Error fetching Level 2 SLA summary" }, 
      { status: 500 }
    );
  }
}