// // app/api/form-submissions/route.ts
// import { PrismaClient } from "@prisma/client";
// import { NextRequest, NextResponse } from "next/server";
// import jwt from 'jsonwebtoken';

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
//     if (!formId || !submittedData) {
//       return NextResponse.json({ message: "Form ID and Submitted Data are required" }, { status: 400 });
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
//         submittedData: JSON.stringify(submittedData),
//       },
//       include: {
//         form: true, // Ensure form is included in the response
//       },
//     });

//     // Create related trouble ticket
//     const troubleTicket = await prisma.troubleTicket.create({
//       data: {
//         title: `Ticket from ${formSubmission.form.formName}`,
//         description: `Form submission details: ${JSON.stringify(submittedData)}`,
//         adminStatus: "PENDING",
//         oemStatus:"PENDING",
//         userId,
//         formSubmissionId: formSubmission.id,
//         formType: formSubmission.form.formName,
//       },
//     });

//     return NextResponse.json(
//       { message: "Form submitted and trouble ticket created", formSubmission, troubleTicket },
//       { status: 201 }
//     );
//   } catch (error) {
//     console.error("Error submitting form:", error);
//     return NextResponse.json({ message: "Internal server error" }, { status: 500 });
//   }
// }
