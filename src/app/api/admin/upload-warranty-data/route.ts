// import { PrismaClient } from "@prisma/client";
// import { NextRequest, NextResponse } from "next/server";

// const prisma = new PrismaClient();

// export async function POST(request: NextRequest) {
//   try {
//     const data = await request.json();

//     if (!Array.isArray(data)) {
//       return NextResponse.json(
//         { message: "Invalid file format. Data should be an array." },
//         { status: 400 }
//       );
//     }

//     // Validate the required fields in each row
//     const requiredFields = ["productType", "serialNumber", "clientName", "warrantySpan", "dateOfPurchase"];
//     for (const row of data) {
//       for (const field of requiredFields) {
//         if (!row[field]) {
//           return NextResponse.json(
//             { message: `Missing required field: ${field} in one or more rows.` },
//             { status: 400 }
//           );
//         }
//       }
//     }

//     // Prepare data for bulk insert
//     const warrantyEntries = data.map((row) => ({
//       productType: row.productType,
//       serialNumber: row.serialNumber,
//       clientName: row.clientName,
//       warrantySpan: row.warrantySpan,
//       dateOfPurchase: new Date(row.dateOfPurchase),
//     }));

//     // Insert data into the WarrantyData table
//     await prisma.warrantyData.createMany({
//       data: warrantyEntries,
//       skipDuplicates: true, // Skip rows with duplicate serial numbers
//     });

//     return NextResponse.json(
//       { message: "Data uploaded successfully." },
//       { status: 201 }
//     );
//   } catch (error: any) {
//     console.error("Error uploading warranty data:", error);
//     return NextResponse.json(
//       { message: "Failed to upload data.", error: error.message },
//       { status: 500 }
//     );
//   } finally {
//     await prisma.$disconnect();
//   }
// }

import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Validate that the input is an array
    if (!Array.isArray(data)) {
      return NextResponse.json(
        { message: "Invalid file format. Data should be an array." },
        { status: 400 }
      );
    }

    // Validate required fields in each row
    const requiredFields = ["productType", "serialNumber", "clientName", "warrantySpan", "dateOfPurchase"];
    for (const row of data) {
      for (const field of requiredFields) {
        if (!row[field]) {
          return NextResponse.json(
            { message: `Missing required field: ${field} in one or more rows.` },
            { status: 400 }
          );
        }
      }
    }

    const results = [];
    for (const row of data) {
      const existingRecord = await prisma.warrantyData.findFirst({
        where: {
          productType: row.productType,
          serialNumber: row.serialNumber,
        },
      });

      if (existingRecord) {
        // Update existing record
        const updatedRecord = await prisma.warrantyData.update({
          where: { id: existingRecord.id },
          data: {
            clientName: row.clientName,
            warrantySpan: row.warrantySpan,
            dateOfPurchase: new Date(row.dateOfPurchase),
          },
        });
        results.push({ status: "updated", record: updatedRecord });
      } else {
        // Insert new record
        const newRecord = await prisma.warrantyData.create({
          data: {
            productType: row.productType,
            serialNumber: row.serialNumber,
            clientName: row.clientName,
            warrantySpan: row.warrantySpan,
            dateOfPurchase: new Date(row.dateOfPurchase),
          },
        });
        results.push({ status: "created", record: newRecord });
      }
    }

    return NextResponse.json(
      { message: "Data processed successfully.", results },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error uploading warranty data:", error);
    return NextResponse.json(
      { message: "Failed to upload data.", error: error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
