import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      minLength: 3,
    },

    description: {
      type: String,
      required: true,
      trim: true,
      minLength: 10,
    },

    price: {
      type: Number,
      required: true,
      index: true,
    },

    discountPrice: {
      type: Number,
    },

    stock: {
      type: Number,
      min: 0,
      required: true,
      index: true,
    },

    bannerImage: {
      type: String,
      required: true,
    },

    slideImages: [
      {
        type: String,
        required: true,
      },
    ],

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

productSchema.index(
  { title: "text", description: "text" },
  { weights: { title: 5, description: 1 } }
);
productSchema.index(
  { isActive: 1 },
  { partialFilterExpression: { isActive: true } }
);
productSchema.index({ category: 1, price: 1 });
productSchema.index({ createdAt: -1 });

productSchema.set("toJSON", { versionKey: false });

const Product = mongoose.model("Product", productSchema);

export default Product;
