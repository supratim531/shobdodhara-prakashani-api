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
    title: { type: String, required: true },
    image: { type: String, required: true },
    price: { type: Number, required: true },
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
