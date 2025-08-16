import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const tokenCookie = request.cookies.get("token")?.value;
    if (!tokenCookie) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Decode the JWT token
    const decoded = jwt.verify(tokenCookie, process.env.JWT_SECRET!);
    const userId = (decoded as any).userId;

    // Parse the request body
    const { troubleTicketId, comment, rating } = await request.json();

    try {
      // Validation
      if (!troubleTicketId || !comment || typeof rating !== "number" || rating < 1 || rating > 5) {
        console.error("Validation Failed:", { troubleTicketId, comment, rating });
        return NextResponse.json(
          { message: "Invalid input. Ensure all fields are provided and rating is between 1 and 5." },
          { status: 400 }
        );
      }

      // Check if trouble ticket exists
      const troubleTicket = await prisma.troubleTicket.findFirst({
        where: {
          id: troubleTicketId,
          userId,
          OR: [{ adminStatus: "COMPLETED" }, { oemStatus: "COMPLETED" }],
        },
      });
      if (!troubleTicket) {
        console.error("Trouble Ticket Not Found or Ineligible:", troubleTicketId);
        return NextResponse.json(
          { message: "Trouble ticket not found or not eligible for feedback." },
          { status: 404 }
        );
      }

      // Check if feedback already exists
      const existingFeedback = await prisma.feedback.findFirst({
        where: { troubleTicketId },
      });
      if (existingFeedback) {
        console.error("Feedback Already Submitted for Ticket:", troubleTicketId);
        return NextResponse.json(
          { message: "Feedback has already been submitted for this trouble ticket." },
          { status: 400 }
        );
      }

      // Create feedback
      const feedback = await prisma.feedback.create({
        data: {
          troubleTicketId,
          comment,
          rating,
          userId,
        },
      });
      console.log("Feedback Created Successfully:", feedback);

      return NextResponse.json({ message: "Feedback submitted successfully.", feedback }, { status: 201 });
    } catch (error) {
      console.error("Error submitting feedback:", error);
      return NextResponse.json({ message: "Internal server error." }, { status: 500 });
    }
  } catch (error) {
    console.error("Error in POST handler:", error);
    return NextResponse.json({ message: "Internal server error." }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
