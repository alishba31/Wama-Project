import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs'; // Or your preferred hashing library
import Joi from 'joi';

// Initialize Prisma Client (same as above)
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

// Define Joi schema for password change validation
const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(8).max(255) // Add complexity rules if needed (regex)
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*()_+\\-=\\[\\]{};\':"\\\\|,.<>\\/?]).{8,}$'))
    .message('New password must be at least 8 characters long and include uppercase, lowercase, number, and special character.')
    .required(),
  confirmPassword: Joi.string().required().valid(Joi.ref('newPassword')).messages({
    'any.only': 'Confirm password must match new password',
  }),
});

interface JwtPayload {
  userId: number; // Assuming userId in JWT is a number
}

export async function PATCH(request: NextRequest) {
  try {
    // 1. Authenticate User
    const tokenCookie = request.cookies.get('token')?.value;
    if (!tokenCookie) {
      return NextResponse.json({ message: 'Unauthorized: No token provided' }, { status: 401 });
    }

    let decoded: JwtPayload;
    try {
      if (!process.env.JWT_SECRET) {
        console.error('JWT_SECRET is not defined.');
        return NextResponse.json({ message: 'Internal server error: JWT configuration missing' }, { status: 500 });
      }
      decoded = jwt.verify(tokenCookie, process.env.JWT_SECRET) as JwtPayload;
    } catch (error) {
      return NextResponse.json({ message: 'Unauthorized: Invalid token' }, { status: 401 });
    }

    const userId = decoded.userId;
    if (!userId || typeof userId !== 'number') {
      return NextResponse.json({ message: 'Invalid token: User ID missing or invalid' }, { status: 401 });
    }

    // 2. Validate Request Body
    const body = await request.json();
    const { error, value } = changePasswordSchema.validate(body);

    if (error) {
      return NextResponse.json({ message: 'Validation Error', details: error.details[0].message }, { status: 400 });
    }

    const { currentPassword, newPassword } = value;

    // 3. Fetch User and Verify Current Password
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    if (!user.password) {
      // This case might occur for users who signed up via OAuth (e.g., Google) and don't have a local password
      return NextResponse.json({ message: 'Password change not applicable for this account type or password not set.' }, { status: 400 });
    }

    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return NextResponse.json({ message: 'Invalid current password' }, { status: 400 });
    }

    // 4. Hash New Password and Update in Database
    const hashedNewPassword = await bcrypt.hash(newPassword, 10); // Salt rounds = 10

    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedNewPassword,
      },
    });

    return NextResponse.json({ message: 'Password changed successfully' }, { status: 200 });

  } catch (error) {
    console.error('Error changing password:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect().catch(e => console.error('Failed to disconnect Prisma', e));
  }
}