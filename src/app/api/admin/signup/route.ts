// File: your-app-directory/app/api/admin/signup/route.ts

import { PrismaClient, User as PrismaUser } from "@prisma/client"; // Import PrismaUser for better typing
import bcrypt from "bcryptjs";
import jwt, { JwtPayload } from 'jsonwebtoken';
import { NextRequest, NextResponse } from "next/server";

// --- START: Define JWT payload for the authenticated CALLER (Admin) ---
interface AuthenticatedAdminPayload extends JwtPayload {
  userId: string; // userId from JWT is a string (ensure your JWT actually contains this)
  email: string;
  role: string;
  // If your JWT for admins also includes canAccessRestrictedFeatures, you can add it here:
  // canAccessRestrictedFeatures?: boolean;
}
// --- END: Define JWT payload ---

// Create a single Prisma client instance to reuse
let prisma: PrismaClient;

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient();
} else {
  // Ensure the prisma instance is re-used during hot-reloading in development
  // @ts-ignore
  if (!global.prisma) {
    // @ts-ignore
    global.prisma = new PrismaClient();
  }
  // @ts-ignore
  prisma = global.prisma;
}

// Export the POST method handler for ADMIN CREATING A USER
export async function POST(request: NextRequest) {
  try {
    // --- START: Authenticate and Authorize the CALLER (Admin) ---
    const adminTokenCookie = request.cookies.get('token');
    if (!adminTokenCookie) {
      return NextResponse.json({ message: "Authentication required: No admin token provided" }, { status: 401 });
    }

    let adminPayload: AuthenticatedAdminPayload;
    try {
      // Ensure JWT_SECRET is set in your environment variables
      if (!process.env.JWT_SECRET) {
        console.error("JWT_SECRET is not defined in environment variables.");
        return NextResponse.json({ message: "Internal server error: JWT secret missing" }, { status: 500 });
      }
      adminPayload = jwt.verify(adminTokenCookie.value, process.env.JWT_SECRET) as AuthenticatedAdminPayload;
    } catch (error) {
      console.error("Admin token verification failed:", error);
      return NextResponse.json({ message: "Authentication failed: Invalid admin token" }, { status: 401 });
    }

    // Validate that the payload contains the necessary fields
    if (!adminPayload.userId || !adminPayload.email || !adminPayload.role) {
        console.error("Admin token payload is missing required fields (userId, email, role).");
        return NextResponse.json({ message: "Authentication failed: Malformed admin token payload" }, { status: 401 });
    }

    // Convert admin's userId from string (from JWT) to number (for Prisma)
    const adminUserIdNumber = parseInt(adminPayload.userId, 10);

    // Validate the conversion
    if (isNaN(adminUserIdNumber)) {
      console.error("Admin token contains invalid userId format:", adminPayload.userId);
      return NextResponse.json({ message: "Authentication failed: Malformed admin user ID in token" }, { status: 401 });
    }

    // Fetch the admin user from DB to verify their role and permissions
    // Use PrismaUser type and cast to include your custom field if not directly in PrismaUser
    const adminUser = await prisma.user.findUnique({
      where: { id: adminUserIdNumber },
    });

    if (!adminUser) {
      return NextResponse.json({ message: "Authentication failed: Admin user not found" }, { status: 401 });
    }

    // Authorization check: Ensure the caller is an ADMIN and has necessary privileges
    // Explicitly cast to include canAccessRestrictedFeatures if it's not directly on PrismaUser
    const typedAdminUser = adminUser as PrismaUser & { canAccessRestrictedFeatures?: boolean };

    const isAdminAllowedToCreateUsers =
      typedAdminUser.role === 'ADMIN' && typedAdminUser.canAccessRestrictedFeatures === true;

    if (!isAdminAllowedToCreateUsers) {
      return NextResponse.json({ message: "Authorization failed: You do not have permission to add users." }, { status: 403 });
    }
    // --- END: Authenticate and Authorize the CALLER (Admin) ---


    // Destructure details for the NEW USER from the request body
    const { email, password, name, role, canAccessRestrictedFeatures }: {
      email: string;
      password: string;
      name: string;
      role: string;
      canAccessRestrictedFeatures: boolean; // This now comes from the request
    } = await request.json();

    // Basic validation for new user's details
    if (!email || !password || !name || !role || typeof canAccessRestrictedFeatures !== 'boolean') {
      return NextResponse.json({
        message: "Email, password, role, name, and a boolean 'canAccessRestrictedFeatures' for the new user are required"
      }, { status: 400 });
    }

    // Validate role to be one of your defined roles
    const validRoles = ["ADMIN", "OEM", "USER"]; // Add any other valid roles
    if (!validRoles.includes(role.toUpperCase())) {
        return NextResponse.json({ message: `Invalid role: ${role}. Must be one of ${validRoles.join(', ')}` }, { status: 400 });
    }

    // Password complexity validation (optional, but good practice here too)
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,25}$/;
    if (!passwordRegex.test(password)) {
      return NextResponse.json({
        message: "Password for the new user must be 8-25 characters, with uppercase, lowercase, number, and special character."
      }, { status: 400 });
    }


    // Check if the user to be created already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }, // Store and check emails in lowercase for consistency
    });

    if (existingUser) {
      return NextResponse.json({ message: "User with this email already exists" }, { status: 409 });
    }

    // Hash the password for the new user
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the new user
    const newUser = await prisma.user.create({
      data: {
        email: email.toLowerCase(), // Store email in lowercase
        password: hashedPassword,
        name,
        role: role.toUpperCase(), // Store role in uppercase for consistency
        canAccessRestrictedFeatures: canAccessRestrictedFeatures, // Use the value from the request
        // Ensure any other default fields from your schema are handled if not provided
      },
    });

    // Create notification settings for the new user
    // Adjust logic based on your actual NotificationSetting schema and needs
    await prisma.notificationSetting.create({
      data: {
        userId: newUser.id,
        ticketEscalation: newUser.role === 'ADMIN' || newUser.role === 'OEM',
        slaBreach: newUser.role === 'ADMIN' || newUser.role === 'OEM',
        newTicketCreated: newUser.role === 'ADMIN',
        ticketStatusChange: newUser.role === 'USER', // Or whatever your logic is
        // Add other notification settings with their defaults or logic
      },
    });

    // Respond with success message and new user details (exclude password)
    return NextResponse.json(
      {
        message: "User created successfully by admin",
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
          canAccessRestrictedFeatures: newUser.canAccessRestrictedFeatures,
          createdAt: newUser.createdAt,
        }
      },
      { status: 201 }
    );

  } catch (error: any) {
    if (error.code === 'P2002' && error.meta?.target?.includes('email')) { // Prisma unique constraint violation on email
      return NextResponse.json({ message: "Email already exists" }, { status: 409 });
    }
    console.error("Error during admin user creation:", error);
    // Avoid sending detailed internal error messages to the client in production
    const errorMessage = process.env.NODE_ENV === 'production' ? "Internal server error" : error.message;
    return NextResponse.json({ message: "Internal server error", details: errorMessage }, { status: 500 });
  } finally {
    // In serverless environments (like Vercel), it's often better not to call $disconnect explicitly
    // as it can interfere with connection pooling. Prisma handles this reasonably well.
    // If you're in a long-running server environment, you might consider it.
    // await prisma.$disconnect().catch(e => console.error("Failed to disconnect Prisma", e));
  }
}