// app/middleware.ts
import { jwtVerify } from 'jose'; // Using jose for JWT verification
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value; // Get JWT token from HTTP-only cookie

  // If no token is found, redirect to the login page
  if (!token) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  try {
    // Verify the JWT token using the secret key
    const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET));

    // Extract the user's role from the token payload
    const role = payload.role;

    // Extract the current path
    const url = request.nextUrl.pathname;

    // Admin-only routes protection
    if (url.startsWith('/admin') && role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/403', request.url)); // Redirect to 403 if not admin
    }

    // User-only routes protection (client module)
    if (url.startsWith('/client') && role !== 'USER') {
      return NextResponse.redirect(new URL('/403', request.url)); // Redirect to 403 if not user
    }
    if (url.startsWith('/oem') && role !== 'OEM') {
      return NextResponse.redirect(new URL('/403', request.url)); // Redirect to 403 if not user
    }
    // Allow access if the role matches the route
    return NextResponse.next();
  } catch (error) {
    // In case of an error (invalid token), redirect to login
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }
}

// Apply middleware to protect specific routes
export const config = {
  matcher: [
    '/admin/:path*', // Protect all /admin routes
    '/client/:path*', // Protect all /client routes
    '/oem/:path*', // Protect all /oem routes
  ],
};
