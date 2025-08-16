// app/api/oem/product-specific-reports/route.ts
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

// GET: Fetch all product-specific reports
export async function GET(request: NextRequest) {
  const tokenCookie = request.cookies.get("token")?.value;
  if (!tokenCookie) {
    return NextResponse.json({ message: "Unauthorized: No token" }, { status: 401 });
  }

  try {
    const decodedToken = jwt.verify(tokenCookie, process.env.JWT_SECRET!);
    // Ensure your JWT payload actually has a userId property
    const userId = (decodedToken as any).userId; 

    if (!userId) {
      // This case might happen if the JWT is valid but doesn't contain userId
      return NextResponse.json({ message: "Unauthorized: Invalid token payload" }, { status: 401 });
    }

    // Optional: You might want to filter reports based on the user or their role if applicable
    // For now, fetching all reports as per original logic
    const reports = await prisma.productSpecificReport.findMany({
      orderBy: {
        // Optional: order by creation date or report ID
        id: 'desc' 
      },
      include: {
        TroubleTicket: { // Information from the associated ticket
          select: {
            id: true, // Good to have ticket ID here
            title: true,
            description: true, // Original ticket description
            adminStatus: true, // Ticket's admin status
            oemStatus: true,   // Ticket's OEM status
            createdAt: true,   // Ticket's creation date
            // You could select more from TroubleTicket if needed for display
          },
        },
      },
    });

    return NextResponse.json(reports, { status: 200 });
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return NextResponse.json({ message: "Unauthorized: Invalid or expired token" }, { status: 401 });
    }
    console.error("Error fetching product-specific reports:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  } finally {
    // Consider using a global Prisma client instance to avoid frequent connect/disconnect
    // await prisma.$disconnect();
  }
}

// POST: Create a new product-specific report
export async function POST(request: NextRequest) {
  const tokenCookie = request.cookies.get("token")?.value;
  if (!tokenCookie) {
    return NextResponse.json({ message: "Unauthorized: No token" }, { status: 401 });
  }

  try {
    const decodedToken = jwt.verify(tokenCookie, process.env.JWT_SECRET!);
    const userId = (decodedToken as any).userId;

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized: Invalid token payload" }, { status: 401 });
    }

    const body = await request.json();
    const {
      productName,      // For this specific report instance
      productCategory,  // For this report
      modelNumber,      // For this report
      manufacturerName, // For this report
      // serialNumber, warrantyStartDate, warrantyEndDate are REMOVED from request body for the report
      ticketId,         // ID of the TroubleTicket this report is about
      ticketDate,       // Date from the TroubleTicket (usually auto-filled on frontend)
      adminStatus,      // Status from the TroubleTicket (auto-filled)
      oemStatus,        // Status from the TroubleTicket (auto-filled)
      ticketType,       // Type from the TroubleTicket (auto-filled)
      claimDescription, // Description from the TroubleTicket (auto-filled, potentially formatted)
      causeOfFailure,   // Manually entered for this report
      adminComments,    // Manually entered for this report
      oemComments,      // Manually entered for this report
    } = body;

    // Validate required fields for THIS report
    // Note: ticketDate, adminStatus, oemStatus, ticketType, claimDescription are usually
    // derived from the selected ticket on the frontend and passed along.
    // The most critical manual entries for the report itself are productName, modelNumber, causeOfFailure.
    if (
      !productName ||
      !modelNumber ||
      !ticketId ||
      !causeOfFailure
      // !ticketDate // Depending on if you strictly require it or can default/derive it
    ) {
      return NextResponse.json(
        { message: "Product Name, Model Number, associated Ticket ID, and Cause of Failure are required." },
        { status: 400 }
      );
    }

    const ticketIdInt = Number(ticketId);
    if (isNaN(ticketIdInt)) {
      return NextResponse.json({ message: "Invalid Ticket ID format." }, { status: 400 });
    }

    // Verify that the associated ticket exists
    const ticket = await prisma.troubleTicket.findUnique({
      where: { id: ticketIdInt },
      include: {
        FormSubmission: true, // To potentially access original submitted data
      },
    });

    if (!ticket) {
      return NextResponse.json({ message: `Associated Ticket with ID ${ticketIdInt} not found.` }, { status: 404 });
    }

    // --- Optional: Validation against ticket's original submitted data ---
    // Since serialNumber is removed from the report, this specific check is removed.
    // You might want to validate `productName` or `modelNumber` from the report
    // against data in `ticket.FormSubmission.submittedData` if that's a requirement.
    // Example (assuming structure of submittedData):
    // const ticketSubmittedData = ticket.FormSubmission?.submittedData as any;
    // const ticketProductName = ticketSubmittedData?.product_name; // Adjust key as per your form
    // if (ticketProductName && ticketProductName.toLowerCase() !== productName.toLowerCase()) {
    //   console.warn(`Warning: Report product name "${productName}" differs from ticket's product name "${ticketProductName}".`);
    //   // Decide if this is a hard error or just a warning
    // }

    const reportData: any = {
      productName,
      modelNumber,
      causeOfFailure,
      ticketId: ticketIdInt,
      // Fields that are often pre-filled from ticket or have defaults
      productCategory: productCategory || "", // Default to empty string if not provided
      manufacturerName: manufacturerName || "",
      ticketDate: ticketDate ? new Date(ticketDate) : new Date(ticket.createdAt), // Use ticket's creation if report ticketDate not given
      adminStatus: adminStatus || ticket.adminStatus, // Default to ticket's current adminStatus
      oemStatus: oemStatus || ticket.oemStatus,     // Default to ticket's current oemStatus
      ticketType: ticketType || ticket.formType,    // Default to ticket's formType
      claimDescription: claimDescription || ticket.description, // Default to ticket's description
      // Optional comments
      adminComments: adminComments || null,
      oemComments: oemComments || null,
    };
    

    // Create new product-specific report
    // Since ticketId is no longer @unique, this will allow multiple reports for the same ticket.
    const newReport = await prisma.productSpecificReport.create({
      data: reportData,
    });

    return NextResponse.json(
      { message: "Product-specific report created successfully", newReport },
      { status: 201 }
    );
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return NextResponse.json({ message: "Unauthorized: Invalid or expired token" }, { status: 401 });
    }
    // Handle Prisma-specific errors, like foreign key constraint if ticketId doesn't exist
    // (though we check for ticket existence above)
    if (error.code === 'P2003' && error.meta?.field_name?.includes('ticketId')) {
        return NextResponse.json({ message: "Invalid associated Ticket ID." }, { status: 400 });
    }
    console.error("Error creating product-specific report:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error.message }, // Send back error message in dev
      { status: 500 }
    );
  } finally {
    // await prisma.$disconnect();
  }
}