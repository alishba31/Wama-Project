import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
interface NotificationData {
  userId: number;
  message: string;
}

export const createNotification = async ({ userId, message }: NotificationData) => {
  try {
    // Create a new notification in the database
    const notification = await prisma.notification.create({
      data: {
        userId,
        message,
      },
    });
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw new Error('Notification creation failed');
  }
};

// Function to notify multiple users (e.g., admin and OEM)
export const notifyUsers = async (userIds: number[], message: string) => {
  try {
    const notifications = await Promise.all(
      userIds.map((userId) => createNotification({ userId, message }))
    );
    return notifications;
  } catch (error) {
    console.error('Error notifying users:', error);
    throw new Error('Notification failed');
  }
};