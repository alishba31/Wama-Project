// import { PrismaClient } from "@prisma/client";
// import { NextRequest, NextResponse } from "next/server";
// import jwt from "jsonwebtoken";

// const prisma = new PrismaClient();

// export async function POST(request: NextRequest) {
//   try {
//     const tokenCookie = request.cookies.get("token")?.value;
//     if (!tokenCookie) {
//       return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
//     }

//     const decoded = jwt.verify(tokenCookie, process.env.JWT_SECRET!);
//     const userId = (decoded as any).userId;

//     const { formId, submittedData } = await request.json();

//     // Validate input
//     if (!formId || !submittedData || !submittedData.serial_NO) {
//       return NextResponse.json(
//         { message: "Form ID, Submitted Data, and Serial Number are required" },
//         { status: 400 }
//       );
//     }

//     const serialNumber = submittedData.serial_NO;

//     // Check if the serial number exists in the WarrantyData table
//     const warrantyRecord = await prisma.warrantyData.findUnique({
//       where: { serialNumber },
//     });

//     if (!warrantyRecord) {
//       return NextResponse.json(
//         { message: `Serial number: ${serialNumber} is not registered in warranty records` },
//         { status: 404 } // Not Found
//       );
//     }
//     // Validate warranty
//     const purchaseDate = new Date(warrantyRecord.dateOfPurchase);

//     // Parse the warranty span (e.g., "5 years" or "14 months")
//     const warrantySpanParts = warrantyRecord.warrantySpan.split(" ");
//     const warrantySpanValue = parseInt(warrantySpanParts[0], 10); // Numeric part
//     const warrantySpanUnit = warrantySpanParts[1]?.toLowerCase(); // Unit part ('years' or 'months')

//     // Convert warranty span to months
//     let warrantySpanMonths = 0;
//     if (warrantySpanUnit === "years") {
//       warrantySpanMonths = warrantySpanValue * 12; // Convert years to months
//     } else if (warrantySpanUnit === "months") {
//       warrantySpanMonths = warrantySpanValue; // Already in months
//     }

//     // Calculate warranty end date
//     const warrantyEndDate = new Date(purchaseDate); // Clone purchaseDate to avoid modifying it
//     warrantyEndDate.setMonth(warrantyEndDate.getMonth() + warrantySpanMonths);

//     // Check if the warranty has expired
//     if (new Date() > warrantyEndDate) {
//       return NextResponse.json(
//         { message: `Serial number: ${warrantyRecord.serialNumber} is out of warranty` },
//         { status: 403 } // Forbidden
//       );
//     }
//     // Check if a claim with the same serial number already exists
//     const existingClaim = await prisma.formSubmission.findFirst({
//       where: {
//         formId,
//         submittedData: {
//           path: ["serial_NO"], // Specify the JSON path
//           equals: serialNumber,
//         },
//       },
//     });

//     if (existingClaim) {
//       return NextResponse.json(
//         { message: `A claim already exists for serial number: ${serialNumber}` },
//         { status: 409 } // Conflict
//       );
//     }

//     // Ensure the form exists
//     const form = await prisma.formDefinition.findUnique({
//       where: { id: formId },
//     });

//     if (!form) {
//       return NextResponse.json({ message: "Form not found" }, { status: 404 });
//     }

//     // Create a form submission
//     const formSubmission = await prisma.formSubmission.create({
//       data: {
//         formId,
//         userId,
//         submittedData,
//         adminStatus: "PENDING",
//         oemStatus:"PENDING",
//         updatedAt: new Date(),
//       },
//       include: {
//         FormDefinition: true,
//       },
//     });

//     // Create related trouble ticket
//     const troubleTicket = await prisma.troubleTicket.create({
//       data: {
//         title: `Ticket from ${form.formName}`,
//         description: `Form submission details: ${JSON.stringify(submittedData)}`,
//         adminStatus: "PENDING",
//         oemStatus:"PENDING",
//         userId,
//         formSubmissionId: formSubmission.id,
//         formType: form.formName,
//         updatedAt: new Date(),
//       },
//     });

//     return NextResponse.json(
//       {
//         message: "Form submitted and trouble ticket created",
//         formSubmission,
//         troubleTicket,
//       },
//       { status: 201 }
//     );
//   } catch (error) {
//     console.error("Error submitting form:", error);
//     return NextResponse.json(
//       { message: "Internal server error" },
//       { status: 500 }
//     );
//   } finally {
//     await prisma.$disconnect();
//   }
// }

// // export async function GET(request: NextRequest) {
// //   const tokenCookie = request.cookies.get("token")?.value;
// //   if (!tokenCookie) {
// //     return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
// //   }

// //   try {
// //     // Verify and decode the token
// //     const decodedToken = jwt.verify(tokenCookie, process.env.JWT_SECRET!);
// //     const userId = (decodedToken as any).userId;

// //     if (!userId) {
// //       return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
// //     }

// //     // Fetch form submissions for the logged-in user
// //     const submissions = await prisma.formSubmission.findMany({
// //       where: { userId },
// //       include: {
// //         FormDefinition: {
// //           select: {
// //             formName: true,
// //             description: true,
// //           },
// //         },
// //       },
// //     });

// //     return NextResponse.json(submissions, { status: 200 });
// //   } catch (error) {
// //     console.error("Error fetching form submissions:", error);
// //     return NextResponse.json(
// //       { message: "Internal server error" },
// //       { status: 500 }
// //     );
// //   } finally {
// //     await prisma.$disconnect();
// //   }
// // }
// export async function GET(request: NextRequest) {
//   const tokenCookie = request.cookies.get("token")?.value;
//   if (!tokenCookie) {
//     return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
//   }

//   try {
//     // Verify and decode the token
//     const decodedToken = jwt.verify(tokenCookie, process.env.JWT_SECRET!);
//     const userId = (decodedToken as any).userId;

//     if (!userId) {
//       return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
//     }

//     // Fetch form submissions for the logged-in user, including submittedData
//     const submissions = await prisma.formSubmission.findMany({
//       where: { userId },
//       include: {
//         FormDefinition: {
//           select: {
//             formName: true,
//             description: true,
//           },
//         },
//       },
//       orderBy: {
//         createdAt: "desc", // Optional: Sort submissions by creation date
//       },
//     });

//     return NextResponse.json(submissions, { status: 200 });
//   } catch (error) {
//     console.error("Error fetching form submissions:", error);
//     return NextResponse.json(
//       { message: "Internal server error" },
//       { status: 500 }
//     );
//   } finally {
//     await prisma.$disconnect();
//   }
// }

// import { PrismaClient } from "@prisma/client";
// import { NextRequest, NextResponse } from "next/server";
// import jwt from "jsonwebtoken";

// const prisma = new PrismaClient();

// export async function POST(request: NextRequest) {
//   try {
//     const tokenCookie = request.cookies.get("token")?.value;
//     if (!tokenCookie) {
//       return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
//     }

//     const decoded = jwt.verify(tokenCookie, process.env.JWT_SECRET!);
//     const userId = (decoded as any).userId;

//     const { formId, submittedData } = await request.json();

//     // Validate input
//     if (!formId || !submittedData || !submittedData.serial_NO) {
//       return NextResponse.json(
//         { message: "Form ID, Submitted Data, and Serial Number are required" },
//         { status: 400 }
//       );
//     }

//     const serialNumber = submittedData.serial_NO;

//     // Check if the serial number exists in the WarrantyData table
//     const warrantyRecord = await prisma.warrantyData.findFirst({
//       where: { serialNumber },
//     });

//     if (!warrantyRecord) {
//       return NextResponse.json(
//         { message: `Serial number: ${serialNumber} is not registered in warranty records` },
//         { status: 404 }
//       );
//     }

//     // Validate warranty
//     const purchaseDate = new Date(warrantyRecord.dateOfPurchase);

//     const warrantySpanParts = warrantyRecord.warrantySpan.split(" ");
//     const warrantySpanValue = parseInt(warrantySpanParts[0], 10);
//     const warrantySpanUnit = warrantySpanParts[1]?.toLowerCase();

//     let warrantySpanMonths = 0;
//     if (warrantySpanUnit === "years") {
//       warrantySpanMonths = warrantySpanValue * 12;
//     } else if (warrantySpanUnit === "months") {
//       warrantySpanMonths = warrantySpanValue;
//     }

//     const warrantyEndDate = new Date(purchaseDate);
//     warrantyEndDate.setMonth(warrantyEndDate.getMonth() + warrantySpanMonths);

//     if (new Date() > warrantyEndDate) {
//       return NextResponse.json(
//         { message: `Serial number: ${warrantyRecord.serialNumber} is out of warranty` },
//         { status: 403 }
//       );
//     }

//     // Check if a claim with the same serial number already exists
//     const existingClaim = await prisma.formSubmission.findFirst({
//       where: {
//         formId,
//         submittedData: {
//           path: ["serial_NO"],
//           equals: serialNumber,
//         },
//       },
//     });

//     if (existingClaim) {
//       return NextResponse.json(
//         { message: `A claim already exists for serial number: ${serialNumber}` },
//         { status: 409 }
//       );
//     }

//     // Ensure the form exists
//     const form = await prisma.formDefinition.findUnique({
//       where: { id: formId },
//     });

//     if (!form) {
//       return NextResponse.json({ message: "Form not found" }, { status: 404 });
//     }

//     // Create a form submission
//     const formSubmission = await prisma.formSubmission.create({
//       data: {
//         formId,
//         userId,
//         submittedData,
//         adminStatus: "PENDING",
//         oemStatus: "PENDING",
//         updatedAt: new Date(),
//       },
//       include: {
//         FormDefinition: true,
//       },
//     });

//     // Create related trouble ticket
//     const troubleTicket = await prisma.troubleTicket.create({
//       data: {
//         title: `Ticket from ${form.formName}`,
//         description: `Form submission details: ${JSON.stringify(submittedData)}`,
//         adminStatus: "PENDING",
//         oemStatus: "PENDING",
//         userId,
//         formSubmissionId: formSubmission.id,
//         formType: form.formName,
//         updatedAt: new Date(),
//       },
//     });

//     return NextResponse.json(
//       {
//         message: "Form submitted and trouble ticket created",
//         formSubmission,
//         troubleTicket,
//       },
//       { status: 201 }
//     );
//   } catch (error) {
//     console.error("Error submitting form:", error);
//     return NextResponse.json(
//       { message: "Internal server error" },
//       { status: 500 }
//     );
//   } finally {
//     await prisma.$disconnect();
//   }
// }
// //GET 
// export async function GET(request: NextRequest) {
//   const tokenCookie = request.cookies.get("token")?.value;
//   if (!tokenCookie) {
//     return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
//   }

//   try {
//     const decodedToken = jwt.verify(tokenCookie, process.env.JWT_SECRET!);
//     const userId = (decodedToken as any).userId;

//     if (!userId) {
//       return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
//     }

//     const submissions = await prisma.formSubmission.findMany({
//       where: { userId },
//       include: {
//         FormDefinition: {
//           select: {
//             formName: true,
//             description: true,
//           },
//         },
//       },
//       orderBy: {
//         createdAt: "desc",
//       },
//     });

//     return NextResponse.json(submissions, { status: 200 });
//   } catch (error) {
//     console.error("Error fetching form submissions:", error);
//     return NextResponse.json(
//       { message: "Internal server error" },
//       { status: 500 }
//     );
//   } finally {
//     await prisma.$disconnect();
//   }
// }



// Assuming this file is located at a path like: app/api/your-submission-endpoint/route.ts
// e.g., app/api/claims/route.ts or app/api/form-submissions/route.ts

import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

// Initialize Prisma Client
// It's good practice to instantiate it once and reuse it.
// For Next.js in development, you might want to handle global instantiation to avoid multiple clients during hot-reloading.
let prisma: PrismaClient;

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient();
} else {
  // @ts-ignore
  if (!global.prisma) {
    // @ts-ignore
    global.prisma = new PrismaClient();
  }
  // @ts-ignore
  prisma = global.prisma;
}

export async function POST(request: NextRequest) {
  try {
    const tokenCookie = request.cookies.get("token")?.value;
    if (!tokenCookie) {
      return NextResponse.json({ message: "Unauthorized: No token provided" }, { status: 401 });
    }

    let decoded: any; // Use 'any' for now, or create a proper type for your JWT payload
    try {
        decoded = jwt.verify(tokenCookie, process.env.JWT_SECRET!);
    } catch (err) {
        return NextResponse.json({ message: "Unauthorized: Invalid token" }, { status: 401 });
    }

    const userId = decoded.userId; // Assuming your JWT payload has a userId field

    if (!userId || isNaN(parseInt(userId))) {
        return NextResponse.json({ message: "Invalid token: User ID missing or invalid" }, { status: 401 });
    }
    const parsedUserId = parseInt(userId);


    const { formId, submittedData } = await request.json();

    if (!formId || !submittedData || !submittedData.serial_NO) {
      return NextResponse.json(
        { message: "Form ID, Submitted Data, and Serial Number are required" },
        { status: 400 }
      );
    }

    const serialNumber = submittedData.serial_NO;

    // 1. Check if the serial number exists in the WarrantyData table
    const warrantyRecord = await prisma.warrantyData.findFirst({
      where: { serialNumber },
    });

    if (!warrantyRecord) {
      return NextResponse.json(
        { message: `Serial number: ${serialNumber} is not registered in warranty records` },
        { status: 404 }
      );
    }

    // 2. Validate warranty
    const purchaseDate = new Date(warrantyRecord.dateOfPurchase);
    const warrantySpanParts = warrantyRecord.warrantySpan.split(" ");
    const warrantySpanValue = parseInt(warrantySpanParts[0], 10);
    const warrantySpanUnit = warrantySpanParts[1]?.toLowerCase();

    let warrantySpanMonths = 0;
    if (warrantySpanUnit === "years") {
      warrantySpanMonths = warrantySpanValue * 12;
    } else if (warrantySpanUnit === "months") {
      warrantySpanMonths = warrantySpanValue;
    } else if (warrantySpanValue > 0) { // If unit is missing but value is present, assume months
        console.warn(`Warranty span unit for ${serialNumber} is unclear: '${warrantyRecord.warrantySpan}'. Assuming months.`);
        warrantySpanMonths = warrantySpanValue;
    }

    const warrantyEndDate = new Date(purchaseDate);
    if (warrantySpanMonths > 0) {
        warrantyEndDate.setMonth(warrantyEndDate.getMonth() + warrantySpanMonths);
    } else {
        // Handle cases where warrantySpan might be invalid or zero
        return NextResponse.json(
            { message: `Invalid warranty span for serial number: ${serialNumber}. Cannot determine warranty period.` },
            { status: 400 }
          );
    }

    if (new Date() > warrantyEndDate) {
      return NextResponse.json(
        { message: `Serial number: ${warrantyRecord.serialNumber} is out of warranty. Warranty ended on ${warrantyEndDate.toDateString()}` },
        { status: 403 } // 403 Forbidden as the action is disallowed due to policy
      );
    }

    // 3. Check if a claim with the same serial number for this formId already exists and its status
    const existingClaim = await prisma.formSubmission.findFirst({
      where: {
        formId, // Check against the specific form type
        submittedData: {
          path: ["serial_NO"], // Prisma JSON filtering to check serial_NO within submittedData
          equals: serialNumber,
        },
      },
      include: {
        TroubleTicket: { // We need the TroubleTicket to check its rejection/completion status
          select: {
            adminStatus: true,
            oemStatus: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc', // Get the most recent claim for this combination
      },
    });

    if (existingClaim) {
      const associatedTicket = existingClaim.TroubleTicket;

      if (associatedTicket) {
        // Check if the previous claim's status allows for a new submission
        const canResubmit =
          associatedTicket.adminStatus === "REJECTED" ||
          associatedTicket.oemStatus === "REJECTED" ||
          associatedTicket.adminStatus === "COMPLETED" ||
          associatedTicket.oemStatus === "COMPLETED";

        if (canResubmit) {
          // Previous claim was REJECTED or COMPLETED, allow new submission.
          // Log this for audit purposes if needed
          console.log(`Allowing new claim for SN: ${serialNumber} as previous claim was ${associatedTicket.adminStatus}/${associatedTicket.oemStatus}`);
        } else {
          // Previous claim was NOT REJECTED or COMPLETED (e.g., PENDING, APPROVED, IN_PROGRESS)
          return NextResponse.json(
            {
              message: `A claim for serial number '${serialNumber}' on this form already exists and its status (Admin: ${associatedTicket.adminStatus}, OEM: ${associatedTicket.oemStatus}) does not permit a new submission. The previous claim must be 'REJECTED' or 'COMPLETED' to submit again.`,
            },
            { status: 409 } // 409 Conflict
          );
        }
      } else {
        // A FormSubmission exists but has no associated TroubleTicket.
        // This indicates an issue with data integrity or an incomplete previous process.
        // It's safer to block resubmission as the status cannot be verified.
        return NextResponse.json(
          {
            message: `A previous claim for serial number '${serialNumber}' on this form exists but its status could not be determined due to a missing associated ticket. Please contact support.`,
          },
          { status: 409 }
        );
      }
    }
    // If code reaches here, it means either no previous claim exists, or it was REJECTED/COMPLETED.

    // 4. Ensure the form definition exists
    const form = await prisma.formDefinition.findUnique({
      where: { id: formId },
    });

    if (!form) {
      return NextResponse.json({ message: "Form not found" }, { status: 404 });
    }

    // 5. Create form submission
    const formSubmission = await prisma.formSubmission.create({
      data: {
        formId,
        userId: parsedUserId,
        submittedData, // This is the JSON object from the client
        adminStatus: "PENDING", // Default status
        oemStatus: "PENDING",   // Default status
        // createdAt will be set by @default(now())
        updatedAt: new Date(), // Explicitly set updatedAt for creation if needed by business logic
      },
      include: {
        FormDefinition: true, // To get formName for the ticket title
      },
    });

    // 6. Create trouble ticket
    const troubleTicket = await prisma.troubleTicket.create({
      data: {
        title: `Ticket for ${form.formName} - SN: ${serialNumber}`, // More specific title
        description: `Form submission details for SN ${serialNumber}: ${JSON.stringify(submittedData)}`,
        adminStatus: "PENDING", // Initial status for the ticket
        oemStatus: "PENDING",   // Initial status for the ticket
        userId: parsedUserId,
        formSubmissionId: formSubmission.id, // Link to the FormSubmission
        formType: form.formName,
        // createdAt will be set by @default(now())
        updatedAt: new Date(), // Explicitly set updatedAt
      },
    });

    // 7. Fetch admins who enabled newTicketCreated notifications
    const adminsToNotify = await prisma.user.findMany({
      where: {
        role: "ADMIN",
        NotificationSetting: {
          some: {
            newTicketCreated: true,
          },
        },
      },
      select: { id: true }, // Only select id for notification creation
    });

    // 8. Notify eligible admins
    if (adminsToNotify.length > 0) {
      await prisma.notification.createMany({ // Efficiently create multiple notifications
        data: adminsToNotify.map((admin) => ({
          userId: admin.id,
          message: `A new ticket "${troubleTicket.title}" has been created.`,
          // type: "NEW_TICKET", // Consider adding a type for notifications
          // isRead: false, // Default for new notifications
        })),
      });
    }

    // 9. Create SLA Record for the trouble ticket
    const slaDurationMinutes = 1; // Example: 1 minute SLA for testing
    const slaEndTime = new Date();
    slaEndTime.setMinutes(slaEndTime.getMinutes() + slaDurationMinutes);

    const slaRecord = await prisma.sLARecord.create({
      data: {
        ticketId: troubleTicket.id,
        slaStatus: "ACTIVE", // Initial SLA status
        slaStartTime: new Date(), // Current time as start time
        slaEndTime,
      },
    });

    // 10. Respond with success
    return NextResponse.json(
      {
        message: "Form submitted, trouble ticket created, and SLA started successfully.",
        formSubmission: { // Return a cleaner object for the client
            id: formSubmission.id,
            formName: formSubmission.FormDefinition.formName,
            submittedAt: formSubmission.createdAt,
            serialNumber: serialNumber, // Echo back the serial number used
        },
        troubleTicket: {
            id: troubleTicket.id,
            title: troubleTicket.title,
        },
        slaRecord: {
            id: slaRecord.id,
            status: slaRecord.slaStatus,
            endTime: slaRecord.slaEndTime,
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error submitting form:", error);
    if (error instanceof jwt.JsonWebTokenError) { // Specific JWT error
        return NextResponse.json({ message: `Authentication error: ${error.message}` }, { status: 401 });
    }
    // Add more specific Prisma error handling if needed
    // For example, if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002')
    return NextResponse.json(
      { message: "Internal server error processing your request." },
      { status: 500 }
    );
  } finally {
    // Disconnect Prisma client in serverless environments or after each request if not using global instance properly
    await prisma.$disconnect().catch(e => console.error("Failed to disconnect Prisma", e));
  }
}

// GET (This function remains unchanged as per your request)
export async function GET(request: NextRequest) {
  const tokenCookie = request.cookies.get("token")?.value;
  if (!tokenCookie) {
    return NextResponse.json({ message: "Unauthorized: No token provided" }, { status: 401 });
  }

  try {
    let decoded: any;
    try {
        decoded = jwt.verify(tokenCookie, process.env.JWT_SECRET!);
    } catch (err) {
        return NextResponse.json({ message: "Unauthorized: Invalid token" }, { status: 401 });
    }
    const userId = decoded.userId;

    if (!userId || isNaN(parseInt(userId))) {
      return NextResponse.json({ message: "Invalid token: User ID missing or invalid" }, { status: 401 });
    }
    const parsedUserId = parseInt(userId);

    const submissions = await prisma.formSubmission.findMany({
      where: { userId: parsedUserId }, // Fetch submissions for the authenticated user
      include: {
        FormDefinition: { // Include related FormDefinition to get formName
          select: {
            formName: true,
            description: true,
          },
        },
        // Optionally include TroubleTicket status if needed on the listing page
        // TroubleTicket: {
        //   select: {
        //     adminStatus: true,
        //     oemStatus: true,
        //   }
        // }
      },
      orderBy: {
        createdAt: "desc", // Show newest submissions first
      },
    });

    return NextResponse.json(submissions, { status: 200 });
  } catch (error) {
    console.error("Error fetching form submissions:", error);
    if (error instanceof jwt.JsonWebTokenError) {
        return NextResponse.json({ message: `Authentication error: ${error.message}` }, { status: 401 });
    }
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect().catch(e => console.error("Failed to disconnect Prisma", e));
  }
}




//workflow code 

// import { PrismaClient } from "@prisma/client";
// import { NextRequest, NextResponse } from "next/server";
// import jwt from "jsonwebtoken";

// const prisma = new PrismaClient();

// export async function POST(request: NextRequest) {
//   try {
//     const tokenCookie = request.cookies.get("token")?.value;
//     if (!tokenCookie) {
//       return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
//     }

//     const decoded = jwt.verify(tokenCookie, process.env.JWT_SECRET!);
//     const userId = (decoded as any).userId;

//     const { formId, submittedData, escalationType } = await request.json();

//     // Validate input
//     if (!formId || !submittedData || !submittedData.serial_NO) {
//       return NextResponse.json(
//         { message: "Form ID, Submitted Data, and Serial Number are required" },
//         { status: 400 }
//       );
//     }

//     const serialNumber = submittedData.serial_NO;

//     // Check if the serial number exists in the WarrantyData table
//     const warrantyRecord = await prisma.warrantyData.findFirst({
//       where: { serialNumber },
//     });

//     if (!warrantyRecord) {
//       return NextResponse.json(
//         { message: `Serial number: ${serialNumber} is not registered in warranty records` },
//         { status: 404 }
//       );
//     }

//     // Validate warranty
//     const purchaseDate = new Date(warrantyRecord.dateOfPurchase);

//     const warrantySpanParts = warrantyRecord.warrantySpan.split(" ");
//     const warrantySpanValue = parseInt(warrantySpanParts[0], 10);
//     const warrantySpanUnit = warrantySpanParts[1]?.toLowerCase();

//     let warrantySpanMonths = 0;
//     if (warrantySpanUnit === "years") {
//       warrantySpanMonths = warrantySpanValue * 12;
//     } else if (warrantySpanUnit === "months") {
//       warrantySpanMonths = warrantySpanValue;
//     }

//     const warrantyEndDate = new Date(purchaseDate);
//     warrantyEndDate.setMonth(warrantyEndDate.getMonth() + warrantySpanMonths);

//     if (new Date() > warrantyEndDate) {
//       return NextResponse.json(
//         { message: `Serial number: ${warrantyRecord.serialNumber} is out of warranty` },
//         { status: 403 }
//       );
//     }

//     // Check if a claim with the same serial number already exists
//     const existingClaim = await prisma.formSubmission.findFirst({
//       where: {
//         formId,
//         submittedData: {
//           path: ["serial_NO"],
//           equals: serialNumber,
//         },
//       },
//     });

//     if (existingClaim) {
//       return NextResponse.json(
//         { message: `A claim already exists for serial number: ${serialNumber}` },
//         { status: 409 }
//       );
//     }

//     // Ensure the form exists
//     const form = await prisma.formDefinition.findUnique({
//       where: { id: formId },
//     });

//     if (!form) {
//       return NextResponse.json({ message: "Form not found" }, { status: 404 });
//     }

//     // Determine escalation level
//     let escalationLevel = 0;
//     if (escalationType === "Admin-OEM") {
//       escalationLevel = 1;
//     } else if (escalationType === "OEM-Admin") {
//       escalationLevel = 2;
//     }

//     // Create form submission
//     const formSubmission = await prisma.formSubmission.create({
//       data: {
//         formId,
//         userId,
//         submittedData,
//         adminStatus: "PENDING",
//         oemStatus: "PENDING",
//         updatedAt: new Date(),
//       },
//       include: {
//         FormDefinition: true,
//       },
//     });

//     // Create trouble ticket
//     const troubleTicket = await prisma.troubleTicket.create({
//       data: {
//         title: `Ticket from ${form.formName}`,
//         description: `Form submission details: ${JSON.stringify(submittedData)}`,
//         adminStatus: "PENDING",
//         oemStatus: "PENDING",
//         userId,
//         formSubmissionId: formSubmission.id,
//         formType: form.formName,
//         escalationLevel,
//         updatedAt: new Date(),
//       },
//     });

//     // Set SLA duration
//     const slaDurationMinutes = 1; // Set SLA duration to 1 minute for testing
//     const slaEndTime = new Date();
//     slaEndTime.setMinutes(slaEndTime.getMinutes() + slaDurationMinutes);

//     // Create SLA Record for the trouble ticket
//     const slaRecord = await prisma.sLARecord.create({
//       data: {
//         ticketId: troubleTicket.id,
//         slaStatus: "ACTIVE",
//         slaStartTime: new Date(),
//         slaEndTime,
//       },
//     });

//     return NextResponse.json(
//       {
//         message: "Form submitted, trouble ticket created, and SLA started",
//         formSubmission,
//         troubleTicket,
//         slaRecord,
//       },
//       { status: 201 }
//     );
//   } catch (error) {
//     console.error("Error submitting form:", error);
//     return NextResponse.json(
//       { message: "Internal server error" },
//       { status: 500 }
//     );
//   } finally {
//     await prisma.$disconnect();
//   }
// }

// // GET
// export async function GET(request: NextRequest) {
//   const tokenCookie = request.cookies.get("token")?.value;
//   if (!tokenCookie) {
//     return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
//   }

//   try {
//     const decodedToken = jwt.verify(tokenCookie, process.env.JWT_SECRET!);
//     const userId = (decodedToken as any).userId;

//     if (!userId) {
//       return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
//     }

//     const submissions = await prisma.formSubmission.findMany({
//       where: { userId },
//       include: {
//         FormDefinition: {
//           select: {
//             formName: true,
//             description: true,
//           },
//         },
//       },
//       orderBy: {
//         createdAt: "desc",
//       },
//     });

//     return NextResponse.json(submissions, { status: 200 });
//   } catch (error) {
//     console.error("Error fetching form submissions:", error);
//     return NextResponse.json(
//       { message: "Internal server error" },
//       { status: 500 }
//     );
//   } finally {
//     await prisma.$disconnect();
//   }
// }
