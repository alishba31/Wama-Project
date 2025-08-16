// // app/api/admin/users/route.ts
// import { NextRequest, NextResponse } from "next/server";
// import { PrismaClient } from "@prisma/client";

// const prisma = new PrismaClient();

// export async function GET() {
//   try {
//     // Fetch users from the database, excluding users with the "ADMIN" role
//     const users = await prisma.user.findMany({
//       where: {
//         role: {
//           not: 'ADMIN', // Exclude users with the role of 'ADMIN'
//         },
//       },
//       select: {
//         id: true,
//         name: true,
//         email: true,
//         role: true, // Fetch only necessary fields
//       },
//     });
    
//     return NextResponse.json(users, { status: 200 });
//   } catch (error) {
//     console.error('Error fetching users:', error);
//     return NextResponse.json({ message: 'Error fetching users' }, { status: 500 });
//   } finally {
//     await prisma.$disconnect();
//   }
// }


// New Code

// /api/admin/users/route.ts
import { PrismaClient, User as PrismaUser } from "@prisma/client";
import jwt from "jsonwebtoken"; // Import jsonwebtoken
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

// Define the structure of your JWT payload
interface JwtPayload {
  userId: number; // Assuming userId in JWT is number, matching Prisma
  email: string;
  role: string;
  canAccessRestrictedFeatures: boolean;
  iat?: number; // Issued at (standard JWT claim)
  exp?: number; // Expiration time (standard JWT claim)
}

// Helper function to get current admin from JWT
async function getCurrentAdminFromRequest(req: NextRequest): Promise<JwtPayload | null> {
  const tokenCookie = req.cookies.get('token');
  if (!tokenCookie) {
    return null;
  }

  const token = tokenCookie.value;
  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    return decoded;
  } catch (error) {
    // Token verification failed (expired, invalid, etc.)
    console.error("JWT verification error:", error);
    return null;
  }
}


// Fetch Users (GET)
export async function GET(req: NextRequest) { // req is needed to access cookies
  try {
    // Optional: Secure this GET endpoint so only admins can fetch user lists
    const currentAdmin = await getCurrentAdminFromRequest(req);
    if (!currentAdmin || currentAdmin.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Forbidden: Admin access required.' }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        canAccessRestrictedFeatures: true,
      },
      orderBy: {
        name: 'asc',
      }
    });
    
    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ message: 'Error fetching users' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// Update User (PUT)
export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { id, name, email, role, canAccessRestrictedFeatures } = body;

  if (!id) {
    return NextResponse.json({ message: 'User ID is required' }, { status: 400 });
  }

  try {
    // 1. Get the current authenticated admin making the request
    const currentAdmin = await getCurrentAdminFromRequest(req);

    if (!currentAdmin) {
      return NextResponse.json({ message: 'Unauthenticated or invalid token' }, { status: 401 });
    }

    if (currentAdmin.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Forbidden: Not an admin' }, { status: 403 });
    }

    // 2. Fetch the user being updated
    const targetUser = await prisma.user.findUnique({
      where: { id: Number(id) },
    });

    if (!targetUser) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // 3. Authorization Logic (same as before, but using currentAdmin from JWT):
    const dataToUpdate: Partial<PrismaUser> = {};

    if (name !== undefined) dataToUpdate.name = name;
    if (email !== undefined) dataToUpdate.email = email;

    if (role !== undefined && role !== targetUser.role) {
      if (currentAdmin.userId === targetUser.id) { // Admin trying to change their own role
        if (!currentAdmin.canAccessRestrictedFeatures && role === 'ADMIN') {
          return NextResponse.json({ message: 'Forbidden: Cannot change your own role to Admin without privileges.' }, { status: 403 });
        }
        dataToUpdate.role = role;
        if (role !== 'ADMIN') {
            dataToUpdate.canAccessRestrictedFeatures = false;
        }
      } else { // Admin trying to change another user's role
        if (!currentAdmin.canAccessRestrictedFeatures) {
          if (role === 'ADMIN' || targetUser.role === 'ADMIN') {
            return NextResponse.json({ message: 'Forbidden: Insufficient privileges to manage Admin roles.' }, { status: 403 });
          }
        }
        dataToUpdate.role = role;
        if (role !== 'ADMIN' && targetUser.role === 'ADMIN') {
            dataToUpdate.canAccessRestrictedFeatures = false;
        }
      }
    }

    if (canAccessRestrictedFeatures !== undefined && (targetUser.role === 'ADMIN' || (role === 'ADMIN' && dataToUpdate.role))) {
      if (currentAdmin.userId === targetUser.id) { // Admin trying to change their own flag
        if (canAccessRestrictedFeatures === true && !currentAdmin.canAccessRestrictedFeatures) {
          return NextResponse.json({ message: 'Forbidden: Cannot grant yourself restricted access.' }, { status: 403 });
        }
        dataToUpdate.canAccessRestrictedFeatures = canAccessRestrictedFeatures;
      } else { // Admin trying to change another admin's flag
        if (!currentAdmin.canAccessRestrictedFeatures) {
          return NextResponse.json({ message: 'Forbidden: Insufficient privileges to manage other Admins restricted access.' }, { status: 403 });
        }
        dataToUpdate.canAccessRestrictedFeatures = canAccessRestrictedFeatures;
      }
    } else if (role !== undefined && role !== 'ADMIN' && dataToUpdate.role && targetUser.canAccessRestrictedFeatures) {
        dataToUpdate.canAccessRestrictedFeatures = false;
    }

    if (Object.keys(dataToUpdate).length === 0) {
        return NextResponse.json({ message: "No update data provided." }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: Number(id) },
      data: dataToUpdate,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        canAccessRestrictedFeatures: true,
      }
    });

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error: any) {
    console.error('Error updating user:', error);
    if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
        return NextResponse.json({ message: 'Email address is already in use.' }, { status: 409 });
    }
    return NextResponse.json({ message: 'Error updating user' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
