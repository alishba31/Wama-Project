// app/api/form-submissions-get/admin/route.ts
import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const formSubmissions = await prisma.formSubmission.findMany({
      include: {
        FormDefinition: { // Include related form definition details
          select: {
            formName: true,
            description: true,
            schema: true, // Include schema field
          },
        },
        User: { // Include user details who submitted the form
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        Attachment: true, // Include related attachments
      },
    });

    return NextResponse.json(formSubmissions, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching form submissions:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
