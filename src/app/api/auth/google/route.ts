import { PrismaClient } from "@prisma/client";
import { NextResponse, NextRequest } from "next/server";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import { logActivity } from "@/lib/logActivity";
const prisma = new PrismaClient();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function POST(request: NextRequest) {
  const { token } = await request.json();

  if (!token) {
    return NextResponse.json({ message: "Token is required" }, { status: 400 });
  }

  try {
    // Verify the Google token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload) {
      return NextResponse.json({ message: "Invalid Google token" }, { status: 401 });
    }

    // Destructure properties from the Google token payload
    const email = payload.email || ""; // Use a default value if undefined
    const name = payload.name || "Unknown"; // Default name
    const picture = payload.picture || ""; // Use an empty string if undefined
    const googleId = payload.sub; // This should always be defined if the token is valid

    // Check if the user already exists in the database
    let user = await prisma.user.findUnique({
      where: { email },
    });

    // If the user doesn't exist, create a new user with a default role (e.g., "USER")
    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name,
          image: picture || '',
          googleId,
          role: "USER", // Assign default role
        },
      });
    }

    // Generate a JWT for the user, including their role
    const jwtToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role }, // Include role in JWT
      process.env.JWT_SECRET as string,
      { expiresIn: "1h" }
    );
    await logActivity(user.id, `User with email ${user.email} logged in`);

    // Create the response and set the JWT in an HTTP-only cookie
    const response = NextResponse.json(
      { message: "Google sign-in successful", role: user.role }, // Return role to frontend
      { status: 200 }
    );

    // Set the JWT in an HTTP-only cookie
    response.cookies.set("token", jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Use secure cookies in production
      maxAge: 60 * 60, // 1 hour
      sameSite: "strict",
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Error during Google sign-in:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
