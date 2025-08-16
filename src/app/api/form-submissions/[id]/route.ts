// import { NextRequest, NextResponse } from "next/server";
// import { PrismaClient } from "@prisma/client";

// const prisma = new PrismaClient();
// //Delete Function
// export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
//   const { id } = params;

//   try {
//     // Convert ID to an integer
//     const formSubmissionId = parseInt(id, 10);
//     if (isNaN(formSubmissionId)) {
//       return NextResponse.json({ message: "Invalid form submission ID" }, { status: 400 });
//     }

//     // Delete the form submission
//     await prisma.formSubmission.delete({
//       where: {
//         id: formSubmissionId,
//       },
//     });

//     return NextResponse.json({ message: "Form submission deleted successfully" }, { status: 200 });
//   } catch (error) {
//     console.error("Error deleting form submission:", error);
//     return NextResponse.json({ message: "Internal server error" }, { status: 500 });
//   } finally {
//     await prisma.$disconnect();
//   }
// }