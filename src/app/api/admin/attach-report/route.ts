import { PrismaClient } from "@prisma/client";
import { writeFile } from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import { join } from "path";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const data = await req.formData();
    const file: File | null = data.get("file") as unknown as File;
    const ticketId = data.get("ticketId") as string;
    const formSubmissionId = data.get("formSubmissionId") as string;

    if (!file || !ticketId || !formSubmissionId) {
      return NextResponse.json(
        { message: "Missing required fields (file, ticketId, formSubmissionId)." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create a unique filename for the report
    const originalFileName = file.name.split('.').slice(0, -1).join('.') || 'report';
    const timestamp = Date.now();
    const uniqueFileName = `${originalFileName}-${ticketId}-${timestamp}.pdf`;
    
    // Define the path to save the file
    const path = join(process.cwd(), "public", "uploads", uniqueFileName);
    await writeFile(path, buffer);
    console.log(`Report saved to ${path}`);

    // Create a new record in the Attachment table
    const newAttachment = await prisma.attachment.create({
      data: {
        fileName: `Ticket #${ticketId} Report.pdf`, // User-friendly display name
        filePath: uniqueFileName, // The path we use to retrieve it
        troubleTicketId: parseInt(ticketId, 10),
        formSubmissionId: parseInt(formSubmissionId, 10),
      },
    });

    return NextResponse.json(
      { success: true, message: "Report attached successfully.", attachment: newAttachment },
      { status: 201 }
    );

  } catch (error) {
    console.error("Error attaching report:", error);
    return NextResponse.json(
      { message: "Failed to attach report." },
      { status: 500 }
    );
  }
}