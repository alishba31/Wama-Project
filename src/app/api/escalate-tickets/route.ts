import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const ESCALATION_INTERVAL_mint = 2;

export async function POST(request: any) {
  try {
    const { ticketId, escalationLevel } = await request.json();

    if (!ticketId || typeof ticketId !== "number") {
      return new Response(JSON.stringify({ message: "Invalid ticket ID provided" }), {
        status: 400,
      });
    }

    if (!escalationLevel || ![1, 2].includes(escalationLevel)) {
      return new Response(JSON.stringify({ message: "Escalation level must be 1 or 2" }), {
        status: 400,
      });
    }

    const ticket = await prisma.troubleTicket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      return new Response(JSON.stringify({ message: "Ticket ID not found" }), {
        status: 404,
      });
    }

    if (ticket.escalationLevel === escalationLevel) {
      return new Response(
        JSON.stringify({ message: `Ticket is already at escalation level ${escalationLevel}` }),
        {
          status: 400,
        }
      );
    }

    const now = new Date();

    // Update escalation level
    const updatedTicket = await prisma.troubleTicket.update({
      where: { id: ticket.id },
      data: {
        escalationLevel: escalationLevel,
        lastEscalatedAt: now,
      },
    });

    // Record escalation history
    await prisma.escalation.create({
      data: {
        ticketId: ticket.id,
        escalatedAt: now,
        escalationLevel: escalationLevel,
      },
    });
    // ✅ Fetch admins who enabled ticketEscalation notifications
  const adminsToNotify = await prisma.user.findMany({
    where: {
      OR: [
        { role: "ADMIN" },
        { role: "OEM" }
      ],
    NotificationSetting: {
      some: {
        ticketEscalation: true,
      },
    },
  },
});

// ✅ Notify eligible admins
await Promise.all(
  adminsToNotify.map((admin) =>
    prisma.notification.create({
      data: {
        userId: admin.id,
        message: `Ticket "${ticket.title}" has been escalated to level ${escalationLevel}.`,
      },
    })
  )
);
    return new Response(
      JSON.stringify({
        message: `Escalation level updated to ${escalationLevel} successfully`,
        updatedTicket,
      }),
      {
        status: 200,
      }
    );
    
  } catch (error) {
    console.error("Error in escalation process:", error);
    return new Response(JSON.stringify({ message: "Internal server error" }), {
      status: 500,
    });
  } finally {
    await prisma.$disconnect();
  }
}
