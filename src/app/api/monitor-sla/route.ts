// import cron from "node-cron";
// import { PrismaClient } from "@prisma/client";

// const prisma = new PrismaClient();

// export default async function monitorSLA() {
//   console.log("🔍 Checking SLA status...");
//   const now = new Date();

//   // Find all SLA records where the SLA end time has passed, but the status is still "IN_PROGRESS"
//   const overdueSLAs = await prisma.sLARecord.findMany({
//     where: {
//       slaEndTime: { lt: now },
//       slaStatus: "ACTIVE || IN_PROGRESS",
//     },
//   });

//   for (const sla of overdueSLAs) {
//     await prisma.sLARecord.update({
//       where: { id: sla.id },
//       data: { slaStatus: "BREACHED" },
//     });

//     console.log(`🚨 SLA Breached for Ticket ID: ${sla.ticketId}`);
//   }
// }

// // Schedule the cron job to run every 5 minutes
// // cron.schedule("*/1 * * * *", async () => {
// //   console.log("⏳ Running SLA Monitoring Cron Job...");
// //   await monitorSLA();
// // });

// console.log("✅ SLA Monitoring Service Started...");

import cron from "node-cron";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function monitorSLA() {
  console.log("🔍 Checking SLA status...");
  const now = new Date();

  // 1️⃣ Find all overdue SLAs
  const overdueSLAs = await prisma.sLARecord.findMany({
    where: {
      slaEndTime: { lt: now },
      slaStatus: { in: ["ACTIVE", "IN_PROGRESS"] },
    },
    include: {
      TroubleTicket: true,  // Include the related ticket for notification
    },
  });

  for (const sla of overdueSLAs) {
    // Update SLA status to BREACHED
    await prisma.sLARecord.update({
      where: { id: sla.id },
      data: { slaStatus: "BREACHED" },
    });

    console.log(`🚨 SLA Breached for Ticket ID: ${sla.ticketId}`);

  // ✅ Notify eligible users about SLA breach based on escalation level
const escalationLevel = sla.TroubleTicket?.escalationLevel;

// Fetch users to notify
let usersToNotify;

if (escalationLevel == 2) {
  // Notify both ADMIN and OEM roles
  usersToNotify = await prisma.user.findMany({
    where: {
      OR: [
        { role: "ADMIN" },
        { role: "OEM" }
      ],
      NotificationSetting: {
        some: {
          slaBreach: true,
        },
      },
    },
  });
} else {
  // Notify only ADMINs
  usersToNotify = await prisma.user.findMany({
    where: {
      role: "ADMIN",
      NotificationSetting: {
        some: {
          slaBreach: true,
        },
      },
    },
  });
}
  

// Create notifications
await Promise.all(
  usersToNotify.map((user) =>
    prisma.notification.create({
      data: {
        userId: user.id,
        message: `SLA BREACHED for Ticket "${sla.TroubleTicket?.title || 'Unknown'}" (ID: ${sla.ticketId}).`,
      },
    })
  )
)};


  // 2️⃣ Find all completed tickets
  const completedTickets = await prisma.troubleTicket.findMany({
    where: {
      OR: [
        { adminStatus: "COMPLETED" },
        { oemStatus: "COMPLETED" },
      ],
    },
  });

  for (const ticket of completedTickets) {
    await prisma.sLARecord.updateMany({
      where: { ticketId: ticket.id },
      data: { slaStatus: "MET" },
    });

    console.log(`✅ SLA Met for Ticket ID: ${ticket.id}`);
  }
}

// ⏳ Schedule the cron job to run every 5 minutes
// cron.schedule("*/1 * * * *", async () => {
//   console.log("⏳ Running SLA Monitoring Cron Job...");
//   await monitorSLA();
// });

// console.log("✅ SLA Monitoring Service Started...");