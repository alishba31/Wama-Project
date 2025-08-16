import { NextRequest, NextResponse } from "next/server";

// Logout Functionality
export async function POST(request: NextRequest) {
  try {
    // Create the response object
    const response = NextResponse.json(
      { message: "Logged out successfully" },
      { status: 200 }
    );

    // Clear the JWT token by setting a blank token with maxAge set to 0
    response.cookies.set('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
      maxAge: 0, // Expire the cookie immediately
      sameSite: 'strict',
      path: '/', // Ensure the cookie is removed from all paths
    });
    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}