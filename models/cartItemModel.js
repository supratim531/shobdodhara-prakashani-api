import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema({
  cartId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Cart",
  },

  productId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Product",
  },

  productSnapshot: {
    sku: { type: String, required: true },
    title: { type: String, required: true },
    image: { type: String, required: true },
    price: { type: Number, required: true },
    height: { type: Number, required: true },
    weight: { type: Number, required: true },
    length: { type: Number, required: true },
    breadth: { type: Number, required: true },
  },

  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1,
  },

  totalPrice: {
    type: Number,
    required: true,
  },
});

cartItemSchema.index({ cartId: 1 });
cartItemSchema.index({ productId: 1 });

const CartItem = mongoose.model("CartItem", cartItemSchema);

export default CartItem;
