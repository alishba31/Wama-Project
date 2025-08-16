// import { PrismaClient } from '@prisma/client';
// import jwt from 'jsonwebtoken';
// import { NextRequest, NextResponse } from 'next/server';

// const prisma = new PrismaClient();
// const JWT_SECRET = process.env.JWT_SECRET!;

// export async function GET(req: NextRequest) {
//   try {
//     const token = req.cookies.get('token')?.value;
//     if (!token) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//     }

//     const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
//     const userId = decoded.userId;

//     const settings = await prisma.notificationSetting.findUnique({
//       where: { userId },
//     });

//     return NextResponse.json(settings || {});
//   } catch (error) {
//     console.error('GET notification settings error:', error);
//     return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
//   } finally {
//     await prisma.$disconnect();
//   }
// }

// export async function PUT(req: NextRequest) {
//   try {
//     const token = req.cookies.get('token')?.value;
//     if (!token) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//     }

//     const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
//     const userId = decoded.userId;

//     const body = await req.json();
//     const {
//       ticketEscalation,
//       slaBreach,
//       newTicketCreated,
//       ticketStatusChange,
//     } = body;

//     const updated = await prisma.notificationSetting.upsert({
//       where: { userId },
//       update: {
//         ticketEscalation,
//         slaBreach,
//         newTicketCreated,
//         ticketStatusChange,
//       },
//       create: {
//         userId,
//         ticketEscalation,
//         slaBreach,
//         newTicketCreated,
//         ticketStatusChange,
//       },
//     });

//     return NextResponse.json(updated);
//   } catch (error) {
//     console.error('PUT notification settings error:', error);
//     return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
//   } finally {
//     await prisma.$disconnect();
//   }
// }

// import { PrismaClient } from '@prisma/client';
// import jwt from 'jsonwebtoken';
// import { NextRequest, NextResponse } from 'next/server';

// const prisma = new PrismaClient();
// const JWT_SECRET = process.env.JWT_SECRET!;

// export async function GET(req: NextRequest) {
//   try {
//     const token = req.cookies.get('token')?.value;
//     if (!token) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//     }

//     const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
//     const userId = decoded.userId;

//     const settings = await prisma.notificationSetting.findUnique({
//       where: { userId },
//     });

//     return NextResponse.json(settings || {});
//   } catch (error) {
//     console.error('GET notification settings error:', error);
//     return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
//   } finally {
//     await prisma.$disconnect();
//   }
// }

// export async function PUT(req: NextRequest) {
//   try {
//     const token = req.cookies.get('token')?.value;
//     if (!token) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//     }

//     const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
//     const userId = decoded.userId;

//     const body = await req.json();
//     const {
//       ticketEscalation,
//       slaBreach,
//       newTicketCreated,
//       ticketStatusChange,
//     } = body;

//     const updated = await prisma.notificationSetting.upsert({
//       where: { userId },
//       update: {
//         ticketEscalation,
//         slaBreach,
//         newTicketCreated,
//         ticketStatusChange,
//       },
//       create: {
//         userId,
//         ticketEscalation,
//         slaBreach,
//         newTicketCreated,
//         ticketStatusChange,
//       },
//     });

//     return NextResponse.json(updated);
//   } catch (error) {
//     console.error('PUT notification settings error:', error);
//     return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
//   } finally {
//     await prisma.$disconnect();
//   }
// }



import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET!;

// Define default settings values, used if no settings are found for a user
const defaultSettingsValues = {
  ticketEscalation: false,
  slaBreach: false,
  newTicketCreated: false,
  ticketStatusChange: false,
};

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    const userId = decoded.userId;

    // Fetch the user to get their role
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }, // Only select the role
    });

    if (!user) {
      // This case should ideally not happen if token is valid and userId maps to an existing user
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const settings = await prisma.notificationSetting.findUnique({
      where: { userId },
    });

    // Return the settings (or defaults if none exist) and the user's role
    return NextResponse.json({
      settings: settings || defaultSettingsValues, // Ensure settings object is always returned
      role: user.role
    });

  } catch (error) {
    console.error('GET notification settings error:', error);
    // Handle specific JWT errors for better client-side feedback
    if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function PUT(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    const userId = decoded.userId;

    const body = await req.json();
    const {
      ticketEscalation,
      slaBreach,
      newTicketCreated,
      ticketStatusChange,
    } = body;

    // Ensure all fields for DB operation have a defined boolean value.
    // If body is missing a field (which shouldn't happen if frontend sends complete state),
    // default to false to prevent Prisma errors for missing required boolean fields.
    const dataForDb = {
      ticketEscalation: ticketEscalation ?? false,
      slaBreach: slaBreach ?? false,
      newTicketCreated: newTicketCreated ?? false,
      ticketStatusChange: ticketStatusChange ?? false,
    };

    const updated = await prisma.notificationSetting.upsert({
      where: { userId },
      update: dataForDb,
      create: {
        userId,
        ...dataForDb,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('PUT notification settings error:', error);
    // Handle specific JWT errors
    if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}