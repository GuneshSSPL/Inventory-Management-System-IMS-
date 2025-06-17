import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config(); // 👈 Important!

async function testEmail() {
  console.log('EMAIL_HOST:', process.env.EMAIL_HOST); // Debugging line
  console.log('EMAIL_PORT:', process.env.EMAIL_PORT);
  console.log('EMAIL_USER:', process.env.EMAIL_USER);

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  try {
    await transporter.verify();
    console.log("Connected to Gmail server!");
  } catch (err) {
    console.error("Failed to connect:", err.message);
  }
}

testEmail();