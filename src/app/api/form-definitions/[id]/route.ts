import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    try {
      const formId = parseInt(params.id);
      const { formName, description, schema } = await request.json();
  
      // Validate input
      if (!formName || !schema) {
        return NextResponse.json({ message: "Form name and schema are required" }, { status: 400 });
      }
  
      // Update the form definition
      const updatedForm = await prisma.formDefinition.update({
        where: { id: formId },
        data: {
          formName,
          description,
          schema: JSON.stringify(schema),
        },
      });
  
      return NextResponse.json({ message: "Form updated successfully", form: updatedForm }, { status: 200 });
    } catch (error) {
      console.error("Error updating form definition:", error);
      return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
  }