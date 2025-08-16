// app/api/uploads/[file]/route.ts
import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";

const UPLOAD_DIR = path.join(process.cwd(), "uploads");

export async function GET(
  request: NextRequest,
  { params }: { params: { file: string } }
) {
  const { file } = params;

  // Safely construct the file path
  const sanitizedFile = path.basename(file); // Prevent directory traversal
  const filePath = path.join(UPLOAD_DIR, sanitizedFile);

  try {
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ message: "File not found" }, { status: 404 });
    }

    const fileContents = await fs.promises.readFile(filePath);

    // Determine the content type
    const fileExtension = path.extname(filePath).toLowerCase();
    const mimeTypes: { [key: string]: string } = {
      ".pdf": "application/pdf",
      ".csv": "text/csv",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".gif": "image/gif",
    };
    const contentType = mimeTypes[fileExtension] || "application/octet-stream";

    return new NextResponse(fileContents, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `inline; filename="${sanitizedFile}"`,
      },
    });
  } catch (error) {
    console.error("Error serving file:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
