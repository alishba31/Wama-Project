// app/api/admin/delete-user/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// DELETE method for deleting a user by admin
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await request.json(); // Get user ID from request body

    // Verify admin token
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Verify JWT token and check if the requester is an admin
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET!);
    const requesterId = (decodedToken as any).userId; // ID of the person making the request
    const requesterRole = (decodedToken as any).role;

    // Only admins can delete users
    if (requesterRole !== 'ADMIN') {
      return NextResponse.json({ message: "Forbidden: You do not have permission to delete users" }, { status: 403 });
    }

    // Prevent an admin from deleting their own account (optional safeguard)
    if (requesterId === userId) {
      return NextResponse.json({ message: "You cannot delete your own account" }, { status: 403 });
    }

    // Delete the user from the database
    const deletedUser = await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({ message: "User deleted successfully", deletedUser }, { status: 200 });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json({ message: "Error deleting user" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
