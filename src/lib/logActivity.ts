// lib/logActivity.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Function to log user activities
export async function logActivity(userId: number, action: string) {
  try {
    await prisma.activityLog.create({
      data: {
        userId,
        action,
      },
    });
  } catch (error) {
    console.error("Error logging activity:", error);
  }
}
 