import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    discountType: {
      type: String,
      enum: ["FLAT", "PERCENTAGE"],
      required: true,
    },

    discountValue: {
      type: Number,
      required: true,
      min: 0,
    },

    // used only when discountType = PERCENTAGE
    maxDiscount: {
      type: Number,
      min: 0,
    },

    minOrderValue: {
      type: Number,
      default: 0,
    },

    // overall platform usage limit (0 = unlimited)
    usageLimit: {
      type: Number,
      default: 0,
    },

    // to support per-user tracking
    perUserUsageLimit: {
      type: Number,
      default: 1,
    },

    // overall usage count
    usageCount: {
      type: Number,
      default: 0,
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

couponSchema.index({ isActive: 1 });
couponSchema.index({ startDate: 1, endDate: 1 });
couponSchema.index({ code: 1 }, { unique: true });

const Coupon = mongoose.model("Coupon", couponSchema);

export default Coupon;
