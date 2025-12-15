import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Order",
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
  },

  pricePerUnit: {
    type: Number,
    required: true,
  },

  totalPrice: {
    type: Number,
    required: true,
  },
});

orderItemSchema.index({ orderId: 1 });
orderItemSchema.index({ productId: 1 });

const OrderItem = mongoose.model("OrderItem", orderItemSchema);

export default OrderItem;
