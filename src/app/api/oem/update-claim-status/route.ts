import { sendNotification } from "@/helpers/sendNotification";
import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { troubleTicketId, newStatus, remarks } = await request.json();

    // Validate input
    if (!troubleTicketId || !newStatus) {
      return NextResponse.json(
        { message: "Trouble ticket ID and new status are required" },
        { status: 400 }
      );
    }

    // Ensure troubleTicketId is an integer
    const troubleTicketIdInt = parseInt(troubleTicketId, 10);
    if (isNaN(troubleTicketIdInt)) {
      return NextResponse.json(
        { message: "Invalid Trouble Ticket ID" },
        { status: 400 }
      );
    }

    // Update the trouble ticket status and remarks
    const updatedTicket = await prisma.troubleTicket.update({
      where: { id: troubleTicketIdInt },
      data: { oemStatus: newStatus, remarks },
      include: {
        User: true,
        FormSubmission: true,
      },
    });

    // Update the related form status
    if (updatedTicket.FormSubmission) {
      await prisma.formSubmission.update({
        where: { id: updatedTicket.FormSubmission.id },
        data: { oemStatus: newStatus },
      });
    }

    // Send notification to the user
    await sendNotification(
      updatedTicket.User.email,
      `Trouble Ticket: ${updatedTicket.title}`,
      `Status updated to: ${updatedTicket.oemStatus}`
    );

    // ✅ Create in-app notification ONLY for the ticket owner
    await prisma.notification.create({
      data: {
        userId: updatedTicket.userId, // Only the ticket owner gets this
        message: `Your ticket "${updatedTicket.title}" status has been updated to "${newStatus}".`,
      },
    });

    return NextResponse.json(
      {
        message: "Trouble ticket and form statuses updated successfully.",
        ticket: updatedTicket,
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error updating statuses:", error.message);
      return NextResponse.json(
        { message: "Internal server error", error: error.message },
        { status: 500 }
      );
    } else {
      console.error("Unexpected error:", error);
      return NextResponse.json(
        { message: "An unexpected error occurred" },
        { status: 500 }
      );
    }
  } finally {
    await prisma.$disconnect();
  }
}
