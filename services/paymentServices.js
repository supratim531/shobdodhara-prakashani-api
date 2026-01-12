import crypto from "crypto";
import Payment from "../models/paymentModel.js";
import { createOrderAfterPayment } from "./orderServices.js";
import { razorpayClient, RAZORPAY_CONFIG } from "../config/razorpayConfig.js";
import { createShiprocketOrder, assignCourier } from "./shiprocketServices.js";

const createRazorpayOrder = async (userId, totalAmount, userDetails) => {
  const razorpayOrder = await razorpayClient.orders.create({
    amount: totalAmount * 100, // Convert to paise
    currency: RAZORPAY_CONFIG.currency,
    receipt: `${RAZORPAY_CONFIG.receipt_prefix}_${Date.now()}`,
    notes: {
      customerId: userId,
      customerEmail: userDetails.email,
      customerPhone: userDetails.phone,
    },
  });

  await Payment.create({
    userId,
    gatewayOrderId: razorpayOrder.id,
    amount: totalAmount,
    currency: RAZORPAY_CONFIG.currency,
    method: "online",
  });

  return razorpayOrder;
};

const verifyPayment = async (
  userId,
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature,
  shippingAddress
) => {
  // Verify Razorpay signature
  const body = razorpayOrderId + "|" + razorpayPaymentId;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest("hex");

  if (expectedSignature !== razorpaySignature) {
    throw new Error("Payment signature verification failed");
  }

  const payment = await Payment.findOneAndUpdate(
    { gatewayOrderId: razorpayOrderId, userId },
    {
      $set: {
        gatewayPaymentId: razorpayPaymentId,
        status: "CAPTURED",
        capturedAt: new Date(),
      },
    },
    { new: true }
  );

  if (!payment) {
    throw new Error("Payment record not found");
  }

  // Create order after successful payment verification
  const order = await createOrderAfterPayment(
    userId,
    payment._id,
    shippingAddress
  );

  // Create Shiprocket order
  const shiprocketOder = await createShiprocketOrder(order._id, "Prepaid");

  // Assign courier for the order
  const assignedCourier = await assignCourier(
    order._id,
    shiprocketOder.shipment_id,
    shiprocketOder.status
  );

  return { order, assignedCourier };
};

const handleWebhook = async (webhookBody, webhookSignature) => {
  // Verify webhook signature
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
    .update(JSON.stringify(webhookBody))
    .digest("hex");

  if (expectedSignature !== webhookSignature) {
    throw new Error("Webhook signature verification failed");
  }

  const { event, payload } = webhookBody;
  const paymentEntity = payload.payment?.entity;

  if (!paymentEntity) {
    throw new Error("Invalid webhook payload");
  }

  // Handle different payment events
  switch (event) {
    case "payment.captured":
      await Payment.findOneAndUpdate(
        { gatewayOrderId: paymentEntity.order_id },
        {
          $set: {
            gatewayPaymentId: paymentEntity.id,
            status: "CAPTURED",
            capturedAt: new Date(),
          },
        }
      );
      break;

    case "payment.failed":
      await Payment.findOneAndUpdate(
        { gatewayOrderId: paymentEntity.order_id },
        {
          $set: {
            gatewayPaymentId: paymentEntity.id,
            status: "FAILED",
            failureReason: paymentEntity.error_description,
          },
        }
      );
      break;

    default:
      console.log(`Unhandled webhook event: ${event}`);
  }

  return { success: true, event };
};

const processPaymentSuccess = async (userId, paymentId, shippingAddress) => {
  // Create order after successful payment
  const order = await createOrderAfterPayment(
    userId,
    paymentId,
    shippingAddress
  );

  // Create Shiprocket order
  const shiprocketOder = await createShiprocketOrder(order._id, "Prepaid");

  // Assign courier for the order
  const assignedCourier = await assignCourier(
    order._id,
    shiprocketOder.shipment_id,
    shiprocketOder.status
  );

  return { order, assignedCourier };
};

export {
  createRazorpayOrder,
  verifyPayment,
  handleWebhook,
  processPaymentSuccess,
};
