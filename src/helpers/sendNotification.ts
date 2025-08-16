// lib/sendNotification.ts
import nodemailer from "nodemailer";

export async function sendNotification(email: string, serialNumber: string, status: string) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: `Update on Claim #${serialNumber}`,
    text: `Dear customer,\n\nThe status of your claim having serial number#${serialNumber} has been updated to: ${status}.\n\nThank you,\nWarranty Management Team`,
  };

  await transporter.sendMail(mailOptions);
}
