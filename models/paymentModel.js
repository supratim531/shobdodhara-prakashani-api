import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
      index: true,
    },

    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      index: true,
    },

    // Gateway fields
    gatewayOrderId: { type: String, required: true, unique: true }, // Razorpay order_id
    gatewayPaymentId: { type: String, unique: true, sparse: true }, // Razorpay payment_id

    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    method: { type: String, required: true },

    status: {
      type: String,
      enum: ["CREATED", "ATTEMPTED", "CAPTURED", "FAILED", "REFUNDED"],
      default: "CREATED",
    },

    // Timestamps
    createdAt: { type: Date, default: Date.now },
    attemptedAt: { type: Date },
    capturedAt: { type: Date },

    // Metadata
    gatewayResponse: { type: Object }, // Store full gateway response
    failureReason: { type: String },
  },
  {
    timestamps: true,
  }
);

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;
