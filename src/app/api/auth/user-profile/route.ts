// /app/api/user/profile-details/route.ts
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import Joi from 'joi';

// Initialize Prisma Client
let prisma: PrismaClient;
if (process.env.NODE_ENV === 'production') {
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

// JWT Payload Interface
interface JwtPayload {
  userId: number;
  // Add other fields if they are in your JWT and you need them
}

// --- GET Method: Fetch current user's name and email ---
export async function GET(req: NextRequest) {
  const tokenCookie = req.cookies.get('token');

  if (!tokenCookie || !tokenCookie.value) {
    return NextResponse.json({ message: "Authentication token not found." }, { status: 401 });
  }
  const token = tokenCookie.value;

  try {
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not defined in /api/user/profile-details (GET)");
      return NextResponse.json({ message: "Server configuration error." }, { status: 500 });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload;

    const userFromDb = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        name: true,
        email: true,
      }
    });

    if (!userFromDb) {
      const response = NextResponse.json({ message: "User not found." }, { status: 404 }); // 404 if user specific to token doesn't exist
      response.cookies.set('token', '', { httpOnly: true, maxAge: -1, path: '/' }); // Clear potentially invalid token
      return response;
    }
    
    return NextResponse.json({
      name: userFromDb.name,
      email: userFromDb.email,
    }, { status: 200 });

  } catch (error) {
    console.error("Error in /api/user/profile-details (GET):", error);
    let message = "Invalid or expired token.";
    let status = 401;
    if (error instanceof jwt.TokenExpiredError) message = "Session expired. Please log in again.";
    else if (error instanceof jwt.JsonWebTokenError) message = "Invalid token. Please log in again.";
    else { message = "An error occurred."; status = 500; }

    const response = NextResponse.json({ message }, { status });
    if (status === 401) {
        response.cookies.set('token', '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: -1, sameSite: 'strict', path: '/' });
    }
    return response;
  }
}

// --- Joi Schema for PATCH (Name Update) ---
const updateNameSchema = Joi.object({
  name: Joi.string().min(1).max(255).required(),
});

// --- PATCH Method: Update user's name ---
export async function PATCH(req: NextRequest) {
  const tokenCookie = req.cookies.get('token');

  if (!tokenCookie || !tokenCookie.value) {
    return NextResponse.json({ message: "Authentication token not found." }, { status: 401 });
  }
  const token = tokenCookie.value;

  let decoded: JwtPayload;
  try {
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not defined in /api/user/profile-details (PATCH)");
      return NextResponse.json({ message: "Server configuration error." }, { status: 500 });
    }
    decoded = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload;
  } catch (error) {
    console.error("Error verifying token in /api/user/profile-details (PATCH):", error);
    let message = "Invalid or expired token.";
    if (error instanceof jwt.TokenExpiredError) message = "Session expired. Please log in again.";
    else if (error instanceof jwt.JsonWebTokenError) message = "Invalid token. Please log in again.";
    const response = NextResponse.json({ message }, { status: 401 });
    response.cookies.set('token', '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: -1, sameSite: 'strict', path: '/' });
    return response;
  }

  const userId = decoded.userId;
  if (!userId || typeof userId !== 'number') {
    return NextResponse.json({ message: "Invalid token: User ID missing or invalid." }, { status: 401 });
  }

  const body = await req.json();

  // Validate name
  const { error: nameValidationError, value: nameValue } = updateNameSchema.validate({ name: body.name });
  if (nameValidationError) {
    return NextResponse.json({ message: "Validation Error", details: nameValidationError.details[0].message }, { status: 400 });
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { name: nameValue.name },
      select: { name: true } // Return the updated name
    });
    return NextResponse.json({ message: "Name updated successfully.", user: { name: updatedUser.name } }, { status: 200 });
  } catch (dbError) {
    console.error("Error updating name in DB:", dbError);
    return NextResponse.json({ message: "Failed to update name." }, { status: 500 });
  }
}