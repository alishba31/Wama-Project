// app/api/admin/feedback/route.ts
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET!;

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized: No token provided' }, { status: 401 });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as { userId: number; role: string }; // Assuming role is in token
    } catch (error) {
      return NextResponse.json({ error: 'Unauthorized: Invalid or expired token' }, { status: 401 });
    }
    
    const userId = decoded.userId;

    // Fetch the user to verify their role from the database (more secure)
    const adminUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!adminUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (adminUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden: Insufficient privileges' }, { status: 403 });
    }

    // Fetch all feedback entries, including related User and TroubleTicket info
    const feedbackEntries = await prisma.feedback.findMany({
      orderBy: {
        createdAt: 'desc', // Show newest feedback first
      },
      include: {
        User: { // Information about the user who gave feedback
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        TroubleTicket: { // Information about the ticket the feedback is for
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    return NextResponse.json(feedbackEntries);

  } catch (error) {
    console.error('GET all feedback error:', error);
    if (error instanceof jwt.JsonWebTokenError) { // Catch specific JWT errors if not caught above
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}