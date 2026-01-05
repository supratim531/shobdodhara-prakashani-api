import dotenv from "dotenv";
import Razorpay from "razorpay";

const environment = process.env.NODE_ENV || "development";
const ENV_PATH =
  environment === "production" ? "./.env.production" : "./.env.development";

dotenv.config({ path: ENV_PATH, quiet: true });

export const razorpayClient = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const RAZORPAY_CONFIG = {
  currency: "INR",
  receipt_prefix: "order_rcptid",
  webhook_secret: process.env.RAZORPAY_WEBHOOK_SECRET,
};
