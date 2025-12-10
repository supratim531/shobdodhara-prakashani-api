import dotenv from "dotenv";
import nodemailer from "nodemailer";

const environment = process.env.NODE_ENV || "development";
const ENV_PATH =
  environment === "production" ? "./.env.production" : "./.env.development";

dotenv.config({ path: ENV_PATH, quiet: true });

const configuration = {
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT) || 587, // 465 or 587
  secure: Number(process.env.SMTP_PORT) === 587 ? false : true, // true for 465, false for 587
  requireTLS: Number(process.env.SMTP_PORT) === 587 ? true : false, // true for 587, false for 465
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
};

const transporter = nodemailer.createTransport({ ...configuration });

console.log("sendMail.js: transporter ->", environment, configuration);

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
