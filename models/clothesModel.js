import mongoose from "mongoose";

const clothesSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },

    clothingType: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    brand: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    gender: {
      type: String,
      required: true,
      enum: ["MEN", "WOMEN", "UNISEX", "KIDS"],
      index: true,
    },

    material: {
      type: String,
      required: true,
      trim: true,
    },

    color: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

clothesSchema.index({ clothingType: 1, brand: 1 });

const Clothes = mongoose.model("Clothes", clothesSchema);

export default Clothes;
