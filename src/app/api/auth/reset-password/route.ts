import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { NextResponse, NextRequest } from "next/server";

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

// Export the POST method handler for resetting the password
export async function POST(request: NextRequest) {
  const { token, password }: { token: string; password: string } = await request.json();

  // Basic validation check
  if (!token || !password) {
    return NextResponse.json({ message: "Token and password are required" }, { status: 400 });
  }

  try {
    // Find the user with the given reset token and ensure the token hasn't expired
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gte: new Date(), // Ensure the token is still valid
        },
      },
    });

    if (!user) {
      return NextResponse.json({ message: "Invalid or expired token" }, { status: 400 });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update the user's password and remove the reset token and expiry
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    // Return success response
    return NextResponse.json({ message: "Password has been reset" }, { status: 200 });
  } catch (error: any) {
    console.error("Error during password reset:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
