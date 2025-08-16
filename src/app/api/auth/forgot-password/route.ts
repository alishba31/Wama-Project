import { PrismaClient } from "@prisma/client";
import crypto from "crypto";
import { addHours } from "date-fns";
import { NextResponse, NextRequest } from "next/server";
import { sendResetEmail } from '@/helpers/mailer'; // Assuming this function is implemented

// Create a single Prisma client instance to reuse
let prisma: PrismaClient;

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient();
} else {
  if (!(global as any).prisma) {
    (global as any).prisma = new PrismaClient();
  }
  prisma = (global as any).prisma;
}

// Export the POST method handler for forgot password
export async function POST(request: NextRequest) {
  const { email }: { email: string } = await request.json();

  // Basic validation check
  if (!email) {
    return NextResponse.json({ message: "Email is required" }, { status: 400 });
  }

  try {
    // Check if the user exists
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Generate a reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = addHours(new Date(), 1); // Token expires in 1 hour

    // Save the token and expiry to the database
    await prisma.user.update({
      where: { email },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    try {
      // Send the reset email using SendGrid
      const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/reset-password?token=${resetToken}`;
      await sendResetEmail(user.email, resetUrl);
    } catch (error) {
      console.error('Error sending password reset email:', error);
      return NextResponse.json({ message: 'Error sending password reset email', status: 500 });
    }
    

    // Send reset email
    // const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${resetToken}`;
    // await sendResetEmail(user.email, resetUrl);

    // Return success response
    return NextResponse.json({ message: "Password reset email sent" }, { status: 200 });
  } catch (error: any) {
    console.error("Error during password reset:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
