import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
    },

    lastName: {
      type: String,
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
    },

    phone: {
      type: String,
      trim: true,
    },

    password: {
      type: String,
      select: false,
    },

    role: {
      type: String,
      enum: ["ADMIN", "USER"],
      default: "USER",
    },

    isOnboarded: {
      type: Boolean,
      default: false,
    },

    verifyExpiresAt: {
      type: Date,
    },

    isActive: {
      type: Boolean,
      required: true,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.index(
  { email: 1 },
  {
    unique: true,
    partialFilterExpression: { email: { $exists: true, $ne: null } },
  }
);
userSchema.index(
  { phone: 1 },
  {
    unique: true,
    partialFilterExpression: { phone: { $exists: true, $ne: null } },
  }
);
userSchema.index({ isActive: 1, role: 1, createdAt: -1 });
userSchema.index({ verifyExpiresAt: 1 }, { expireAfterSeconds: 0 });

const User = mongoose.model("User", userSchema);

export default User;
