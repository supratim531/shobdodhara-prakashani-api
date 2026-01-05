import Razorpay from "razorpay";

export const razorpayClient = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const RAZORPAY_CONFIG = {
  currency: "INR",
  receipt_prefix: "order_rcptid_",
  webhook_secret: process.env.RAZORPAY_WEBHOOK_SECRET,
};
