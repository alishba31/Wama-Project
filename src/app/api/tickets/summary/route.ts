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

// // GET Trouble Ticket Summary Stats
// export async function GET(req: NextRequest) {
//   try {
//     const [total, solved, pending, inProgress] = await Promise.all([
//       prisma.troubleTicket.count(),

//       prisma.troubleTicket.count({
//         where: {
//           adminStatus: "COMPLETED",
//         //   oemStatus: "COMPLETED",
//         },
//       }),

//       prisma.troubleTicket.count({
//         where: {
//           OR: [
//             { adminStatus: "PENDING" },
//             // { oemStatus: "PENDING" },
//           ],
//         },
//       }),

//       prisma.troubleTicket.count({
//         where: {
//           OR: [
//             { adminStatus: "IN_PROGRESS" },
//             // { oemStatus: "IN_PROGRESS" },
//           ],
//         },
//       }),
//     ]);

//     return NextResponse.json({
//       totalTickets: total,
//       solvedTickets: solved,
//       pendingTickets: pending,
//       inProgressTickets: inProgress,
//     }, { status: 200 });

//   } catch (error) {
//     console.error("Error fetching ticket summary:", error);
//     return NextResponse.json({ message: "Error fetching ticket summary" }, { status: 500 });
//   }
// }


// New Code
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

// // GET Trouble Ticket Summary Stats
// export async function GET(req: NextRequest) {
//   try {
//     const [total, solved, pending, inProgress] = await Promise.all([
//       prisma.troubleTicket.count(),
//       prisma.troubleTicket.count({
//         where: {
//           adminStatus: "COMPLETED",
//         },
//       }),
//       prisma.troubleTicket.count({
//         where: {
//           OR: [
//             { adminStatus: "PENDING" },
//           ],
//         },
//       }),
//       prisma.troubleTicket.count({
//         where: {
//           OR: [
//             { adminStatus: "IN_PROGRESS" },
//           ],
//         },
//       }),
//     ]);

//     return NextResponse.json({
//       totalTickets: total,
//       solvedTickets: solved,
//       pendingTickets: pending,
//       inProgressTickets: inProgress,
//     }, { status: 200 });

//   } catch (error) {
//     console.error("Error fetching ticket summary:", error);
//     return NextResponse.json(
//       { message: "Error fetching ticket summary" }, 
//       { status: 500 }
//     );
//   }
// }


// File: /api/tickets/summary/route.ts (or your path)

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

// GET Trouble Ticket Summary Stats
export async function GET(req: NextRequest) {
  try {
    // STEP 1: Get the search term from the URL. We'll treat it as a user name.
    const { searchParams } = new URL(req.url);
    const userName = searchParams.get('client'); // The param is 'client', but we interpret it as a user's name

    // STEP 2: Create a 'where' clause to filter by the user's name.
    // If userName is null, the whereClause will be an empty object, matching all records.
    let whereClause = {};
    if (userName) {
      whereClause = {
        // Based on your schema: filter through the 'User' relation on the 'TroubleTicket' model.
        User: {
          name: {
            contains: userName,
            mode: 'insensitive', // Case-insensitive search
          },
        },
      };
    }

    // STEP 3: Apply the whereClause to all your database count queries
    const [total, solved, pending, inProgress] = await Promise.all([
      prisma.troubleTicket.count({
        where: whereClause, // Filter total count by user
      }),
      prisma.troubleTicket.count({
        where: {
          ...whereClause, // Apply user filter here
          adminStatus: "COMPLETED",
        },
      }),
      prisma.troubleTicket.count({
        where: {
          ...whereClause, // Apply user filter here
          OR: [
            { adminStatus: "PENDING" },
          ],
        },
      }),
      prisma.troubleTicket.count({
        where: {
          ...whereClause, // Apply user filter here
          OR: [
            { adminStatus: "IN_PROGRESS" },
          ],
        },
      }),
    ]);

    return NextResponse.json({
      totalTickets: total,
      solvedTickets: solved,
      pendingTickets: pending,
      inProgressTickets: inProgress,
    }, { status: 200 });

  } catch (error) {
    console.error("Error fetching ticket summary:", error);
    return NextResponse.json(
      { message: "Error fetching ticket summary" }, 
      { status: 500 }
    );
  }
}