import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { NextResponse, NextRequest } from "next/server";
import jwt from 'jsonwebtoken';

let prisma: PrismaClient;
if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient();
} else {
  if (!(global as any).prisma) {
    (global as any).prisma = new PrismaClient();
  }
  prisma = (global as any).prisma;
}

export async function POST(request: NextRequest) {
  const { email, password, name, role }: { email: string; password: string; name: string; role: string } = await request.json();

  if (!email || !password || !name || !role) {
    return NextResponse.json({ message: "Email, password, role, and name are required" }, { status: 400 });
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ message: "User already exists" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name, role },
    });

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    );

    const response = NextResponse.json({ message: "User created successfully", user }, { status: 201 });
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60,
      sameSite: 'strict',
      path: '/',
    });

    // Redirect to client dashboard after sign-up
    response.headers.set('Location', '/client');
    return response;
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ message: "Email already exists" }, { status: 409 });
    }
    console.error("Error during user sign-up:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
