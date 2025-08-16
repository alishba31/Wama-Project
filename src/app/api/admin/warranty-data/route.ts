import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

// Add new item to WarrantyData
export async function POST(request: NextRequest) {
  try {
    const { productType, serialNumber, clientName, warrantySpan, dateOfPurchase } = await request.json();

    if (!productType || !serialNumber || !clientName || !warrantySpan || !dateOfPurchase) {
      return NextResponse.json(
        { message: "All fields (productType, serialNumber, clientName, warrantySpan, dateOfPurchase) are required." },
        { status: 400 }
      );
    }

     // Check if a record with the same productType and serialNumber already exists
     const existingRecord = await prisma.warrantyData.findFirst({
      where: {
        productType,
        serialNumber,
      },
    });

    // If a record exists, return a conflict error
    if (existingRecord) {
      return NextResponse.json(
        { message: "A record with the same product type and serial number already exists." },
        { status: 409 } // Conflict status
      );
    }

    const newItem = await prisma.warrantyData.create({
      data: {
        productType,
        serialNumber,
        clientName,
        warrantySpan,
        dateOfPurchase: new Date(dateOfPurchase),
      },
    });

    return NextResponse.json({ message: "Item added successfully", newItem }, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error adding item:", error.message);
      return NextResponse.json({ message: "Internal server error", error: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: "Unexpected error occurred." }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// Read items from WarrantyData
export async function GET(request: NextRequest) {
  try {
    const items = await prisma.warrantyData.findMany();

    return NextResponse.json(items, { status: 200 });
  } catch (error) {
    console.error("Error reading items:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// Update an existing item in WarrantyData
export async function PUT(request: NextRequest) {
  try {
    const { id, productType, serialNumber, clientName, warrantySpan, dateOfPurchase } = await request.json();

    if (!id) {
      return NextResponse.json({ message: "Item ID is required for update." }, { status: 400 });
    }

    const updatedItem = await prisma.warrantyData.update({
      where: { id },
      data: {
        productType,
        serialNumber,
        clientName,
        warrantySpan,
        dateOfPurchase: dateOfPurchase ? new Date(dateOfPurchase) : undefined,
      },
    });

    return NextResponse.json({ message: "Item updated successfully", updatedItem }, { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error updating item:", error.message);
      return NextResponse.json({ message: "Internal server error", error: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: "Unexpected error occurred." }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// // Delete an item from WarrantyData
export async function DELETE(request: NextRequest) {
    try {
      const { searchParams } = new URL(request.url);
      const id = searchParams.get("id");
  
      if (!id) {
        return NextResponse.json({ message: "Item ID is required for deletion." }, { status: 400 });
      }
  
      const idInt = parseInt(id, 10);
      if (isNaN(idInt)) {
        return NextResponse.json({ message: "Invalid Item ID." }, { status: 400 });
      }
  
      await prisma.warrantyData.delete({
        where: { id: idInt },
      });
  
      return NextResponse.json({ message: "Item deleted successfully." }, { status: 200 });
    } catch (error:any) {
      console.error("Error deleting item:", error);
      return NextResponse.json(
        { message: "Failed to delete item.", error: error.message },
        { status: 500 }
      );
    } finally {
      await prisma.$disconnect();
    }
  }