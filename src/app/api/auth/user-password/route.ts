// /app/api/user/change-password/route.ts
import { PrismaClient } from "@prisma/client";
import bcrypt from 'bcryptjs';
import Joi from 'joi';
import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

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
}

// --- Joi Schema for PATCH (Password Change) ---
const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(8).max(255)
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*()_+\\-=\\[\\]{};\':"\\\\|,.<>\\/?]).{8,}$'))
    .message('New password must be at least 8 characters long and include uppercase, lowercase, number, and special character.')
    .required(),
  confirmPassword: Joi.string().required().valid(Joi.ref('newPassword')).messages({
    'any.only': 'Confirm password must match new password',
    'string.empty': 'Confirm password is required',
    'any.required': 'Confirm password is required',
  }),
});

// --- PATCH Method: Change user's password ---
export async function PATCH(req: NextRequest) {
  const tokenCookie = req.cookies.get('token');

  if (!tokenCookie || !tokenCookie.value) {
    return NextResponse.json({ message: "Authentication token not found." }, { status: 401 });
  }
  const token = tokenCookie.value;

  let decoded: JwtPayload;
  try {
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not defined in /api/user/change-password (PATCH)");
      return NextResponse.json({ message: "Server configuration error." }, { status: 500 });
    }
    decoded = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload;
  } catch (error) {
    console.error("Error verifying token in /api/user/change-password (PATCH):", error);
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

  const { error: passwordValidationError, value: passwordValue } = changePasswordSchema.validate(body);
  if (passwordValidationError) {
    return NextResponse.json({ message: "Validation Error", details: passwordValidationError.details[0].message }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }
    if (!user.password) {
      return NextResponse.json({ message: "Password change not applicable for this account type (e.g., OAuth user)." }, { status: 400 });
    }

    const isCurrentPasswordValid = await bcrypt.compare(passwordValue.currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return NextResponse.json({ message: "Invalid current password." }, { status: 400 });
    }

    const hashedNewPassword = await bcrypt.hash(passwordValue.newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });
    return NextResponse.json({ message: "Password changed successfully." }, { status: 200 });
  } catch (dbError) {
    console.error("Error changing password in DB:", dbError);
    return NextResponse.json({ message: "Failed to change password." }, { status: 500 });
  }
}