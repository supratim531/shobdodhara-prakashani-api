import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
  {
    // contact = email OR phone.
    // Example stored values: "email:abc@gmail.com" OR "phone:9876543210"
    contact: {
      type: String,
      required: true,
      index: true,
    },

    otp: {
      type: String,
      required: true,
    },

    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 },
    },

    isUsed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const OTP = mongoose.model("OTP", otpSchema);

export default OTP;
