// app/api/oem/available-tickets/route.ts
import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

// Assuming you have a global prisma instance or import it
// import { prisma } from "@/lib/prisma"; 
const prisma = new PrismaClient(); // Or use your global instance

export interface AvailableTicketForOEM {
  id: number;
  title: string;
  createdAt: Date;
  adminStatus: string;
  oemStatus: string;
  formType: string;
  description: string;
  // You might also want to include product details from the related FormSubmission's submittedData
  // if you want to pre-fill productName, modelNumber etc. from the ticket itself.
  // This would require a more complex query including the FormSubmission and its data.
}

export async function GET(request: NextRequest) {
  try {
    const availableTickets = await prisma.troubleTicket.findMany({
      where: {
        escalationLevel: 2,
        // The `ProductSpecificReport: { none: {} }` filter is REMOVED
        // Now, tickets will appear in this list even if they already have
        // one or more ProductSpecificReport records associated with them.
        
        // You might still want other filters, e.g., oemStatus
        // oemStatus: {
        //   notIn: ['CLOSED', 'RESOLVED']
        // }
      },
      select: {
        id: true,
        title: true,
        createdAt: true,
        adminStatus: true,
        oemStatus: true,
        formType: true,
        description: true,
        // If you want to pre-fill more data from the ticket's original submission:
        // FormSubmission: {
        //   select: {
        //     submittedData: true // This will be JSON, you'll need to parse it on the frontend
        //   }
        // }
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Type assertion might need adjustment if you include FormSubmission.submittedData
    const responseData: AvailableTicketForOEM[] = availableTickets.map(ticket => ({
        ...ticket,
        createdAt: new Date(ticket.createdAt),
        // If FormSubmission is included:
        // submittedData: ticket.FormSubmission?.submittedData // Handle potential null
    }));

    return NextResponse.json(responseData, { status: 200 });

  } catch (error: any) {
    console.error("Error fetching available tickets for OEM:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 }
    );
  } finally {
    // Handle prisma disconnect if necessary
  }
}