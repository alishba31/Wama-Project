// prisma/seed.ts

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

// Initialize Prisma Client
const prisma = new PrismaClient();

// Define role constants for consistency
const ROLE_ADMIN = 'ADMIN';
// You can define other roles if you plan to seed them in the future
// const ROLE_OEM = 'oem';
// const ROLE_CLIENT = 'client';

async function main() {
  console.log('🚀 Starting database seeding...');

  // --- 1. Seed Initial Admin User ---
  const adminEmail = process.env.INITIAL_ADMIN_EMAIL;
  const adminPassword = process.env.INITIAL_ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    console.error(
      '❌ ERROR: INITIAL_ADMIN_EMAIL or INITIAL_ADMIN_PASSWORD is not set in the .env file.'
    );
    console.error('👉 Please set them and try seeding again.');
    await prisma.$disconnect(); // Disconnect before exiting
    process.exit(1); // Exit with an error code
  }

  // Check if the admin user already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (existingAdmin) {
    console.log(`✅ Admin user with email "${adminEmail}" already exists. Skipping creation.`);
  } else {
    // Hash the password
    const hashedPassword = await bcrypt.hash(adminPassword, 10); // 12 is a good salt round

    // Create the admin user
    try {
      const adminUser = await prisma.user.create({
        data: {
          email: adminEmail,
          password: hashedPassword,
          name: 'Administrator', // You can make this configurable or choose a default
          role: ROLE_ADMIN,
          canAccessRestrictedFeatures: true, // Admins should typically have all access
          // Create the related NotificationSetting record
          NotificationSetting: {
            create: {
              // Set default notification preferences for the admin
              ticketEscalation: true,
              slaBreach: true,
              newTicketCreated: true,
              ticketStatusChange: true,
            },
          },
          // Add any other required fields for your User model with default values
        },
        include: {
          // Ensure the created NotificationSetting is included in the returned adminUser object
          NotificationSetting: true,
        },
      });

      console.log(`👍 Successfully created admin user: ${adminUser.email} (ID: ${adminUser.id})`);

      // Access NotificationSetting as an array and get the first (and only, in this case) element
      if (adminUser.NotificationSetting && adminUser.NotificationSetting.length > 0) {
        const notificationSetting = adminUser.NotificationSetting[0];
        console.log(`   - With Notification Settings ID: ${notificationSetting.id}`);
      } else {
        // This should ideally not be reached if the nested create and include are correct.
        console.warn(`   - Notification Settings were not created or included for admin user: ${adminUser.email}. Check schema and seed logic.`);
      }

    } catch (error) {
      console.error(`❌ Error creating admin user "${adminEmail}":`, error);
      // Consider logging the full error object for more details if it's complex
      // console.error(error);
    }
  }

  // --- You can add more seeding logic here for other data if needed ---
  // For example, seeding default FormDefinitions, etc.
  // const defaultFormName = "General Inquiry Form";
  // let defaultForm = await prisma.formDefinition.findFirst({
  //   where: { formName: defaultFormName }
  // });
  // if (!defaultForm) {
  //   // ... create form definition ...
  //   // defaultForm = await prisma.formDefinition.create({ ... });
  //   console.log(`🌱 Created default form definition: ${defaultFormName}`);
  // } else {
  //   console.log(`✅ Default form definition "${defaultFormName}" already exists.`);
  // }

  console.log('🏁 Database seeding finished.');
}

// Execute the main function
main()
  .catch(async (e) => {
    console.error('❌ An error occurred during the seeding process:', e);
    await prisma.$disconnect(); // Ensure Prisma Client disconnects on error
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect(); // Ensure Prisma Client disconnects after successful execution or unhandled error in main
  });