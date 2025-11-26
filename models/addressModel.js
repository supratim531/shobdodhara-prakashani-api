import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
      index: true,
    },

    recipientName: {
      type: String,
      trim: true,
      maxlength: 100,
    },

    phone: {
      type: String,
      trim: true,
    },

    addressLine1: {
      type: String,
      required: [true, "Address Line 1 cannot be empty"],
      trim: true,
      maxlength: 255,
    },

    addressLine2: {
      type: String,
      trim: true,
      maxlength: 255,
    },

    landmark: {
      type: String,
      trim: true,
      maxlength: 150,
    },

    country: {
      type: String,
      required: [true, "Country is required"],
      trim: true,
      maxlength: 100,
    },

    state: {
      type: String,
      required: [true, "State is required"],
      trim: true,
      maxlength: 100,
    },

    city: {
      type: String,
      required: [true, "City is required"],
      trim: true,
      maxlength: 100,
    },

    zipCode: {
      type: String,
      required: [true, "ZIP Code is required"],
      trim: true,
    },

    addressType: {
      type: String,
      enum: ["HOME", "WORK", "OTHER"],
      default: "HOME",
    },

    isDefault: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

addressSchema.index(
  { userId: 1, isDefault: 1 },
  { unique: true, partialFilterExpression: { isDefault: true } }
);
addressSchema.index({ createdAt: -1 });

const Address = mongoose.model("Address", addressSchema);

export default Address;
