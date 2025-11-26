import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },

    totalPrice: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      required: true,
    },

    paymentId: {
      type: String,
      required: true,
      unique: true,
    },

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

const Order = mongoose.model("Order", orderSchema);

export default Order;
