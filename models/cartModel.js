import mongoose from "mongoose";

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
      unique: true,
    },

    status: {
      type: String,
      enum: ["ACTIVE", "ABANDONED", "CONVERTED"],
      default: "ACTIVE",
    },

    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

cartSchema.index({ userId: 1 });

const Cart = mongoose.model("Cart", cartSchema);

export default Cart;
