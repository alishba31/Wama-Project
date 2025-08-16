import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
export async function DELETE(request: NextRequest) {
    try {
      const tokenCookie = request.cookies.get("token")?.value;
      if (!tokenCookie) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
      }
  
      const decoded = jwt.verify(tokenCookie, process.env.JWT_SECRET!);
      const userId = (decoded as any).userId;
  
      const url = new URL(request.url);
      const formSubmissionId = parseInt(url.pathname.split("/").pop() || "");
  
      if (isNaN(formSubmissionId)) {
        return NextResponse.json({ message: "Invalid form submission ID" }, { status: 400 });
      }
  
      // Check if the form submission exists and belongs to the user
      const formSubmission = await prisma.formSubmission.findUnique({
        where: { id: formSubmissionId },
      });
  
      if (!formSubmission || formSubmission.userId !== userId) {
        return NextResponse.json({ message: "Form submission not found or access denied" }, { status: 404 });
      }
  
      // Delete related trouble ticket first
      await prisma.troubleTicket.deleteMany({
        where: { formSubmissionId },
      });
  
      // Delete the form submission
      await prisma.formSubmission.delete({
        where: { id: formSubmissionId },
      });
  
      return NextResponse.json({ message: "Form submission deleted successfully" }, { status: 200 });
    } catch (error) {
      console.error("Error deleting form submission:", error);
      return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    } finally {
      await prisma.$disconnect();
    }
  }
  
  