import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },

    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      unique: true,
      ref: "Payment",
    },

    totalPrice: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ["CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"],
      default: "CONFIRMED",
    },

    shippingAddress: { type: Object, required: true },

    // Shiprocket integration fields
    shiprocketOrderId: { type: String },
    awbCode: { type: String },
    courierCompany: { type: String },
    trackingUrl: { type: String },
    shiprocketStatus: { type: String },

    orderedAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

orderSchema.index({ userId: 1, orderedAt: -1 });
orderSchema.index({ shiprocketOrderId: 1 });
orderSchema.index({ awbCode: 1 });

const Order = mongoose.model("Order", orderSchema);

export default Order;
