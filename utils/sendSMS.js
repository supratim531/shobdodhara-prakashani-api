import dotenv from "dotenv";
import twilio from "twilio";

const environment = process.env.NODE_ENV || "development";
const ENV_PATH =
  environment === "production" ? "./.env.production" : "./.env.development";

dotenv.config({ path: ENV_PATH, quiet: true });

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN,
);

console.log("sendSMS.js: client ->", environment, client);

const sendSMS = async ({ phone, body }) => {
  const sms = {
    from: process.env.TWILIO_PHONE_NUMBER,
    to: `+91${phone}`,
    body,
  };

  try {
    const message = await client.messages.create(sms);
    return message;
  } catch (error) {
    throw error;
  }
};

export default sendSMS;
