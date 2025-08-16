// /api/auth/login/route.ts (or wherever your POST login handler is)
import { logActivity } from "@/lib/logActivity"; // Assuming this path is correct
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  const { email, password }: { email: string; password: string } = await request.json();

  if (!email || !password) {
    return NextResponse.json({ message: "Email and password are required" }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      // Select the canAccessRestrictedFeatures field
      select: {
        id: true,
        email: true,
        password: true,
        role: true,
        canAccessRestrictedFeatures: true, // <-- SELECT THIS
      }
    });

    if (!user || !user.password) {
      return NextResponse.json({ message: "Invalid email or password" }, { status: 401 });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return NextResponse.json({ message: "Invalid email or password" }, { status: 401 });
    }

    // Prepare payload for JWT
    const jwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      canAccessRestrictedFeatures: user.canAccessRestrictedFeatures, // <-- INCLUDE THIS
    };

    const token = jwt.sign(
      jwtPayload,
      process.env.JWT_SECRET!,
      { expiresIn: '2h' } // Token expiration time (was 1h, changed to 2h to match cookie maxAge)
    );

    await logActivity(user.id, `User with email ${user.email} logged in`);

    const response = NextResponse.json(
      {
        message: "User authenticated successfully",
        role: user.role, // You might want to send more user details to the client if needed
        // For security, avoid sending the full token or sensitive flags like canAccessRestrictedFeatures
        // directly in the JSON response body if the client doesn't strictly need them there.
        // The presence of the cookie and the role should be enough for client-side UI adjustments.
      },
      { status: 200 }
    );

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 2, // 2 hours
      sameSite: 'strict',
      path: '/',
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}