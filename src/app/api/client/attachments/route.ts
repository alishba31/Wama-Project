// app/api/client/attachments/route.ts
import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import fs from 'fs/promises';
import path from 'path';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export const config = {
  api: {
    bodyParser: false, // Disable body parser to handle file uploads
  },
};

export async function POST(request: NextRequest) {
  try {
    // JWT Authentication
    const tokenCookie = request.cookies.get("token")?.value;
    if (!tokenCookie) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decodedToken = jwt.verify(tokenCookie, process.env.JWT_SECRET!);
    const userId = (decodedToken as any).userId;

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Parse form data
    const formData = await request.formData();
    const formSubmissionId = parseInt(formData.get('formSubmissionId') as string);
    const troubleTicketId = parseInt(formData.get('troubleTicketId') as string);

    if (!formSubmissionId || !troubleTicketId) {
      return NextResponse.json({ message: "Missing formSubmissionId or troubleTicketId" }, { status: 400 });
    }

    const files = formData.getAll('file');
    if (!files.length) {
      return NextResponse.json({ message: "No files uploaded" }, { status: 400 });
    }

    // Directory to save uploads
    const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
    await fs.mkdir(UPLOAD_DIR, { recursive: true }); // Create directory if it doesn't exist

    const savedAttachments = [];
    for (const file of files) {
      if (file instanceof File) {
        const fileData = await file.arrayBuffer();
        const buffer = Buffer.from(fileData);

        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
        const fileName = `${file.name}-${uniqueSuffix}`;
        const filePath = path.join(UPLOAD_DIR, fileName);

        await fs.writeFile(filePath, buffer);

        // Save file metadata to database
        const attachment = await prisma.attachment.create({
          data: {
            fileName, // Only store relative fileName
            filePath: fileName, // Store relative path (not absolute path)
            uploadedAt: new Date(),
            formSubmissionId,
            troubleTicketId,
          },
        });

        savedAttachments.push(attachment);
      }
    }

    return NextResponse.json({ 
      message: "File(s) uploaded successfully", 
      attachments: savedAttachments 
    }, { status: 201 });
  } catch (error) {
    console.error("Error uploading file(s):", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
