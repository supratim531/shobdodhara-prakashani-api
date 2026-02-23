import crypto from "crypto";
import Payment from "../models/paymentModel.js";
import { createOrderAfterPayment } from "./orderServices.js";
import { razorpayClient, RAZORPAY_CONFIG } from "../config/razorpayConfig.js";
import {
  createShiprocketOrder,
  assignCourier,
  schedulePickup,
} from "./shiprocketServices.js";

const createRazorpayOrder = async (userId, totalAmount, userDetails) => {
  const totalAmountInPaise = +(totalAmount * 100).toFixed(2);
  const razorpayOrder = await razorpayClient.orders.create({
    amount: totalAmountInPaise,
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
  shippingAddress,
  courierId,
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
    { new: true },
  );

  if (!payment) {
    throw new Error("Payment record not found");
  }

  // Create order after successful payment verification
  const order = await createOrderAfterPayment(
    userId,
    payment._id,
    shippingAddress,
  );

  // // Create Shiprocket order
  // const shiprocketOrder = await createShiprocketOrder(order._id, "Prepaid");

  // // Assign courier for the order
  // const assignedCourier = await assignCourier(
  //   order._id,
  //   shiprocketOrder.shipment_id,
  //   courierId,
  //   shiprocketOrder.status,
  // );

  // // Schedule pickup (MOST IMPORTANT)
  // const scheduledPickup = await schedulePickup(
  //   order._id,
  //   shiprocketOrder.shipment_id,
  // );

  // return { order, shiprocketOrder, assignedCourier, scheduledPickup };
  // return { order, shiprocketOrder };
  return { order };
};

const handleWebhook = async (webhookData, webhookSignature) => {
  // Verify webhook signature
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
    .update(JSON.stringify(webhookData))
    .digest("hex");

  if (expectedSignature !== webhookSignature) {
    throw new Error("Webhook signature verification failed");
  }

  const { event, payload } = webhookData;
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
        },
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
        },
      );
      break;

    default:
      console.log(`Unhandled webhook event: ${event}`);
  }

  return { success: true, event };
};

const processPaymentSuccess = async (
  userId,
  paymentId,
  shippingAddress,
  courierId,
) => {
  // Create order after successful payment
  const order = await createOrderAfterPayment(
    userId,
    paymentId,
    shippingAddress,
  );

  // Create Shiprocket order
  const shiprocketOrder = await createShiprocketOrder(order._id, "Prepaid");

  // Assign courier for the order
  const assignedCourier = await assignCourier(
    order._id,
    shiprocketOrder.shipment_id,
    courierId,
    shiprocketOrder.status,
  );

  // Schedule pickup (MOST IMPORTANT)
  const scheduledPickup = await schedulePickup(
    order._id,
    shiprocketOrder.shipment_id,
  );

  return { order, shiprocketOrder, assignedCourier, scheduledPickup };
};

export {
  createRazorpayOrder,
  verifyPayment,
  handleWebhook,
  processPaymentSuccess,
};
