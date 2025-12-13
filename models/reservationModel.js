import mongoose from "mongoose";

const reservationSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Product",
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

reservationSchema.index({ productId: 1, userId: 1 });
reservationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Reservation = mongoose.model("Reservation", reservationSchema);

export default Reservation;
