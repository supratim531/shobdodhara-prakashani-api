import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config({ path: "./.env", quiet: true });

console.log(process.env.SMTP_HOST);
console.log(process.env.SMTP_PORT);
console.log(process.env.EMAIL_USER);
console.log(process.env.EMAIL_PASS);

const transporter = nodemailer.createTransport({
  // host: process.env.SMTP_HOST || "smtp.gmail.com",
  // port: Number(process.env.SMTP_PORT) || 587, // 465 or 587
  // secure: Number(process.env.SMTP_PORT) === 587 ? false : true, // true for 465, false for 587
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: 587,
  secure: false,
  requireTLS: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendMail = async ({ email, subject, body }) => {
  const mail = {
    to: email,
    subject,
    html: body,
  };

  try {
    const response = await transporter.sendMail(mail);
    return response;
  } catch (error) {
    throw error;
  }
};

export default sendMail;
