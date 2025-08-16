// /app/api/auth/me/route.ts
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

// This interface should match the payload you're signing into the JWT during login
interface JwtPayload {
  userId: number; // Matches user.id from Prisma (Int)
  email: string;
  role: string;
  canAccessRestrictedFeatures: boolean;
  iat?: number; // Standard JWT claim: Issued At
  exp?: number; // Standard JWT claim: Expiration Time
}

export async function GET(req: NextRequest) {
  const tokenCookie = req.cookies.get('token');

  if (!tokenCookie || !tokenCookie.value) {
    return NextResponse.json({ message: "Authentication token not found." }, { status: 401 });
  }

  const token = tokenCookie.value;

  try {
    // Verify the token using the same secret key used during login
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

    // Optional: You might want to do a quick database check to ensure the user still exists
    // and hasn't been disabled, though the JWT itself is self-contained.
    // This adds an extra layer but also an extra DB call per request to this endpoint.
    // For this example, we'll trust the JWT's contents if it's valid and not expired.
    /*
    const userFromDb = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, role: true, canAccessRestrictedFeatures: true, email: true, name: true } // select necessary fields
    });

    if (!userFromDb) {
      // User might have been deleted after token was issued
      const response = NextResponse.json({ message: "User not found or token invalid." }, { status: 401 });
      response.cookies.set('token', '', { httpOnly: true, maxAge: -1, path: '/' }); // Clear invalid token
      return response;
    }
    */
    
    // If trusting the JWT directly after verification:
    // Respond with the necessary user details for the client
    return NextResponse.json({
      id: decoded.userId, // Client might need ID for "editing self" checks
      email: decoded.email,
      role: decoded.role,
      canAccessRestrictedFeatures: decoded.canAccessRestrictedFeatures,
      // You can include other non-sensitive details from the JWT if needed by the frontend
      // name: decoded.name, // If 'name' was included in JWT payload
    }, { status: 200 });

  } catch (error) {
    // Handle errors during token verification (e.g., TokenExpiredError, JsonWebTokenError)
    console.error("Error verifying token in /api/auth/me:", error);
    
    let message = "Invalid or expired token.";
    if (error instanceof jwt.TokenExpiredError) {
      message = "Session expired. Please log in again.";
    } else if (error instanceof jwt.JsonWebTokenError) {
      message = "Invalid token. Please log in again.";
    }

    // It's good practice to clear an invalid/expired token cookie
    const response = NextResponse.json({ message }, { status: 401 });
    response.cookies.set('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: -1, // Instructs browser to delete immediately
      sameSite: 'strict',
      path: '/',
    });
    return response;
  } finally {
    // Disconnecting prisma client is usually not necessary for short-lived serverless functions
    // as Prisma manages connections. However, if you prefer explicit disconnection:
    // await prisma.$disconnect();
  }
}