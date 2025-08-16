// // import { PrismaClient } from "@prisma/client";
// // import { NextResponse, NextRequest } from "next/server";

// // let prisma: PrismaClient;

// // if (process.env.NODE_ENV === "production") {
// //   prisma = new PrismaClient();
// // } else {
// //   if (!(global as any).prisma) {
// //     (global as any).prisma = new PrismaClient();
// //   }
// //   prisma = (global as any).prisma;
// // }

// // // GET SLA Summary Stats
// // export async function GET(req: NextRequest) {
// //   try {
// //     const [totalSLAs, breachedSLAs, activeSLAs, metSLAs] = await Promise.all([
// //       // Total SLAs
// //       prisma.sLARecord.count(),

// //       // Breached SLAs (SLA status = "BREACHED")
// //       prisma.sLARecord.count({
// //         where: {
// //           slaStatus: "BREACHED",
// //         },
// //       }),

// //       // Active SLAs (SLA status = "ACTIVE")
// //       prisma.sLARecord.count({
// //         where: {
// //           slaStatus: "ACTIVE",
// //         },
// //       }),

// //       // Met SLAs (SLA status = "MET")
// //       prisma.sLARecord.count({
// //         where: {
// //           slaStatus: "MET",
// //         },
// //       }),
// //     ]);

// //     return NextResponse.json({
// //       totalSLAs,
// //       breachedSLAs,
// //       activeSLAs,
// //       metSLAs,
// //     }, { status: 200 });

// //   } catch (error) {
// //     console.error("Error fetching SLA summary:", error);
// //     return NextResponse.json({ message: "Error fetching SLA summary" }, { status: 500 });
// //   }
// // }


// import { PrismaClient } from "@prisma/client";
// import { NextRequest, NextResponse } from "next/server";

// let prisma: PrismaClient;

// if (process.env.NODE_ENV === "production") {
//   prisma = new PrismaClient();
// } else {
//   if (!(global as any).prisma) {
//     (global as any).prisma = new PrismaClient();
//   }
//   prisma = (global as any).prisma;
// }

// // Get SLA summary statistics including counts and timeline data
// export async function GET(req: NextRequest) {
//   try {
//     // Count total SLAs, breached SLAs, active SLAs, and met SLAs
//     const [totalSLAs, breachedSLAs, activeSLAs, metSLAs, slaTimeline] = await Promise.all([
//       prisma.sLARecord.count(), // Total SLAs
//       prisma.sLARecord.count({ where: { slaStatus: "BREACHED" } }), // Breached SLAs
//       prisma.sLARecord.count({ where: { slaStatus: "ACTIVE" } }), // Active SLAs
//       prisma.sLARecord.count({ where: { slaStatus: "MET" } }), // Met SLAs
//       prisma.sLARecord.findMany({
//         select: {
//           slaStartTime: true,
//           slaEndTime: true,
//           slaStatus: true,
//           createdAt: true,
//         },
//         orderBy: { createdAt: "desc" },
//         take: 10, // Fetch last 10 records for timeline
//       }),
//     ]);

//     // Preparing timeline data (time-based breakdown)
//     const slaTimelineData = slaTimeline.map((sla) => ({
//       startTime: sla.slaStartTime,
//       endTime: sla.slaEndTime,
//       status: sla.slaStatus,
//       createdAt: sla.createdAt,
//     }));

//     return NextResponse.json(
//       {
//         totalSLAs,
//         breachedSLAs,
//         activeSLAs,
//         metSLAs,
//         slaTimelineData,
//       },
//       { status: 200 }
//     );
//   } catch (error) {
//     console.error("Error fetching SLA summary:", error);
//     return NextResponse.json({ message: "Error fetching SLA summary" }, { status: 500 });
//   }
// }


// import { PrismaClient } from "@prisma/client";
// import { NextResponse, NextRequest } from "next/server";

// let prisma: PrismaClient;

// if (process.env.NODE_ENV === "production") {
//   prisma = new PrismaClient();
// } else {
//   if (!(global as any).prisma) {
//     (global as any).prisma = new PrismaClient();
//   }
//   prisma = (global as any).prisma;
// }

// // Get all SLA summary statistics
// export async function GET(req: NextRequest) {
//   try {
//     // Get all trouble tickets
//     const allTickets = await prisma.troubleTicket.findMany({
//       select: { id: true }
//     });
//     const allTicketIds = allTickets.map(ticket => ticket.id);

//     const [
//       totalSLAs,
//       breachedSLAs,
//       activeSLAs,
//       metSLAs,
//       slaTimeline
//     ] = await Promise.all([
//       prisma.sLARecord.count({
//         where: { ticketId: { in: allTicketIds } }
//       }),
//       prisma.sLARecord.count({
//         where: { 
//           ticketId: { in: allTicketIds },
//           slaStatus: "BREACHED" 
//         }
//       }),
//       prisma.sLARecord.count({
//         where: { 
//           ticketId: { in: allTicketIds },
//           slaStatus: "ACTIVE" 
//         }
//       }),
//       prisma.sLARecord.count({
//         where: { 
//           ticketId: { in: allTicketIds },
//           slaStatus: "MET" 
//         }
//       }),
//       prisma.sLARecord.findMany({
//         where: { ticketId: { in: allTicketIds } },
//         select: {
//           slaStartTime: true,
//           slaEndTime: true,
//           slaStatus: true,
//           createdAt: true,
//         },
//         orderBy: { createdAt: "desc" },
//         take: 7,
//       }),
//     ]);

//     // Format timeline data by day
//     const timelineByDay: Record<string, { met: number; breached: number; active: number }> = {};
    
//     slaTimeline.forEach(sla => {
//       const date = new Date(sla.createdAt).toISOString().split('T')[0];
//       if (!timelineByDay[date]) {
//         timelineByDay[date] = { met: 0, breached: 0, active: 0 };
//       }
      
//       if (sla.slaStatus === "MET") timelineByDay[date].met++;
//       if (sla.slaStatus === "BREACHED") timelineByDay[date].breached++;
//       if (sla.slaStatus === "ACTIVE") timelineByDay[date].active++;
//     });

//     // Convert to array format for chart
//     const slaTimelineData = Object.entries(timelineByDay).map(([date, counts]) => ({
//       date,
//       met: counts.met,
//       breached: counts.breached,
//       active: counts.active
//     })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

//     return NextResponse.json(
//       {
//         totalSLAs,
//         breachedSLAs,
//         activeSLAs,
//         metSLAs,
//         slaTimelineData,
//       },
//       { status: 200 }
//     );
//   } catch (error) {
//     console.error("Error fetching SLA summary:", error);
//     return NextResponse.json(
//       { message: "Error fetching SLA summary" }, 
//       { status: 500 }
//     );
//   }
// }




// File: /api/sla/summary/route.ts (or your path)

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

// Get all SLA summary statistics
export async function GET(req: NextRequest) {
  try {
    // STEP 1: Get the search term from the URL, which we'll use as the user name.
    const { searchParams } = new URL(req.url);
    const userName = searchParams.get('client');

    // STEP 2: Create a 'where' clause to filter TroubleTickets by the user's name.
    let ticketWhereClause = {};
    if (userName) {
      ticketWhereClause = {
        // Based on your schema: filter through the 'User' relation on the 'TroubleTicket' model.
        User: {
          name: {
            contains: userName,
            mode: 'insensitive',
          },
        },
      };
    }

    // STEP 3: Fetch only the ticket IDs that match the user filter.
    const filteredTickets = await prisma.troubleTicket.findMany({
      where: ticketWhereClause,
      select: { id: true }
    });
    const filteredTicketIds = filteredTickets.map(ticket => ticket.id);

    // STEP 4: Handle the case where a user is searched but has no tickets.
    // This improves performance by avoiding unnecessary queries.
    if (userName && filteredTicketIds.length === 0) {
        return NextResponse.json({
            totalSLAs: 0,
            breachedSLAs: 0,
            activeSLAs: 0,
            metSLAs: 0,
            slaTimelineData: [],
        });
    }

    // STEP 5: All subsequent queries will now use the correctly filtered list of ticket IDs.
    // Your original Promise.all structure remains effective.
    const [
      totalSLAs,
      breachedSLAs,
      activeSLAs,
      metSLAs,
      slaTimeline
    ] = await Promise.all([
      prisma.sLARecord.count({
        where: { ticketId: { in: filteredTicketIds } }
      }),
      prisma.sLARecord.count({
        where: { 
          ticketId: { in: filteredTicketIds },
          slaStatus: "BREACHED" 
        }
      }),
      prisma.sLARecord.count({
        where: { 
          ticketId: { in: filteredTicketIds },
          slaStatus: "ACTIVE" 
        }
      }),
      prisma.sLARecord.count({
        where: { 
          ticketId: { in: filteredTicketIds },
          slaStatus: "MET" 
        }
      }),
      prisma.sLARecord.findMany({
        where: { ticketId: { in: filteredTicketIds } },
        select: {
          slaStatus: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        take: 50, // Fetch more records to ensure we can build a 7-day timeline
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

    // Convert to array, sort to get the 7 most recent days, then reverse for chronological chart display
    const slaTimelineData = Object.entries(timelineByDay).map(([date, counts]) => ({
      date,
      met: counts.met,
      breached: counts.breached,
      active: counts.active
    }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) // Sort newest first
    .slice(0, 7) // Take the 7 most recent days
    .reverse(); // Reverse for chart (oldest to newest)

    return NextResponse.json(
      {
        totalSLAs,
        breachedSLAs,
        activeSLAs,
        metSLAs,
        slaTimelineData,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching SLA summary:", error);
    return NextResponse.json(
      { message: "Error fetching SLA summary" }, 
      { status: 500 }
    );
  }
}