
import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

// GET: Fetch all product-specific reports
export async function GET(request: NextRequest) {
  const tokenCookie = request.cookies.get("token")?.value;
  if (!tokenCookie) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const decodedToken = jwt.verify(tokenCookie, process.env.JWT_SECRET!);
    const userId = (decodedToken as any).userId;

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const reports = await prisma.productSpecificReport.findMany({
      include: {
        TroubleTicket: {
          select: {
            title: true,
            description: true,
            adminStatus: true,
            oemStatus: true,
            createdAt: true,
          },
        },
      },
    });

    return NextResponse.json(reports, { status: 200 });
  } catch (error) {
    console.error("Error fetching product-specific reports:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// POST: Create a new product-specific report
export async function POST(request: NextRequest) {
  const tokenCookie = request.cookies.get("token")?.value;
  if (!tokenCookie) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const decodedToken = jwt.verify(tokenCookie, process.env.JWT_SECRET!);
    const userId = (decodedToken as any).userId;

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const {
      productName,
      productCategory,
      serialNumber,
      modelNumber,
      manufacturerName,
      warrantyStartDate,
      warrantyEndDate,
      ticketId,
      ticketDate,
      adminStatus,
      oemStatus,
      ticketType,
      claimDescription,
      causeOfFailure,
      adminComments,
      oemComments,
    } = await request.json();

    // Validate required fields
    if (
      !productName ||
      !serialNumber ||
      !modelNumber ||
      !warrantyStartDate ||
      !warrantyEndDate ||
      !ticketId ) {
      return NextResponse.json(
        { message: "All fields are required to create the report." },
        { status: 400 }
      );
    }

    // Ensure `ticketId` is an integer
    const ticketIdInt = Number(ticketId);

    if (isNaN(ticketIdInt)) {
      return NextResponse.json({ message: "Invalid ticket ID" }, { status: 400 });
    }

    // Verify that the ticket exists
    const ticket = await prisma.troubleTicket.findUnique({
      where: { id: ticketIdInt },
      include: {
        FormSubmission: true,
      },
    });

    if (!ticket) {
      return NextResponse.json({ message: "Ticket not found" }, { status: 404 });
    }

    // Check if the serial number matches the one in the ticket's associated claim
    const ticketSubmittedData = ticket.FormSubmission?.submittedData as any; // Cast to `any`
    const ticketSerialNumber = ticketSubmittedData?.serial_NO;

    if (ticketSerialNumber !== serialNumber) {
      return NextResponse.json(
        { message: "The serial number does not match the ticket's claim." },
        { status: 400 }
      );
    }

    // Check if the product name matches the one in the ticket's associated claim
    const ticketProductName = ticketSubmittedData?.name;

    if (ticketProductName && ticketProductName !== productName) {
      return NextResponse.json(
        { message: "The product name does not match the ticket's claim." },
        { status: 400 }
      );
    }

    // Create a new product-specific report
    const newReport = await prisma.productSpecificReport.create({
      data: {
        productName,
        productCategory,
        serialNumber,
        modelNumber,
        manufacturerName,
        warrantyStartDate: new Date(warrantyStartDate),
        warrantyEndDate: new Date(warrantyEndDate),
        ticketId: ticketIdInt,
        ticketDate: new Date(ticketDate),
        adminStatus,
        oemStatus,
        ticketType,
        claimDescription,
        causeOfFailure,
        adminComments,
        oemComments,
      },
    });

    return NextResponse.json(
      { message: "Product-specific report created successfully", newReport },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating product-specific report:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

