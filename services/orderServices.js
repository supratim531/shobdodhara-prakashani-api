import mongoose from "mongoose";
import Order from "../models/orderModel.js";
import OrderItem from "../models/orderItemModel.js";
import Reservation from "../models/reservationModel.js";
import { fetchCartItems } from "./cartServices.js";
import { getPaginationParams, buildMeta } from "../utils/pagination.js";

const fetchAllUserOrders = async (userId, query) => {
  const { page, perPage, skip } = getPaginationParams(query);
  const [result] = await Order.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },

    {
      $facet: {
        data: [
          { $sort: { orderedAt: -1 } },
          { $skip: skip },
          { $limit: perPage },
          {
            $lookup: {
              from: "orderitems",
              localField: "_id",
              foreignField: "orderId",
              as: "items",
            },
          },
          {
            $project: {
              __v: 0,
              "items.__v": 0,
              "items.orderId": 0,
            },
          },
        ],

        totalCount: [{ $count: "count" }],
      },
    },

    {
      $addFields: {
        totalItems: {
          $ifNull: [{ $arrayElemAt: ["$totalCount.count", 0] }, 0],
        },
      },
    },

    { $project: { data: 1, totalItems: 1 } },
  ]);
  items = result?.data || [];
  totalItems = result?.totalItems || 0;
  const meta = buildMeta({ totalItems, page, perPage, paginationLimit: 10 });

  return { items, meta };
};

const fetchUserOrderById = async (userId, orderId) => {
  const item = await Order.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(orderId),
        userId: new mongoose.Types.ObjectId(userId),
      },
    },

    {
      $lookup: {
        from: "orderitems",
        localField: "_id",
        foreignField: "orderId",
        as: "items",
      },
    },

    {
      $project: {
        __v: 0,
        "items.__v": 0,
        "items.orderId": 0,
      },
    },
  ]);

  if (!item.length) {
    throw new Error("Order not found.");
  }

  return item[0];
};

const createOrderAfterPayment = async (userId, paymentId, shippingAddress) => {
  // Fetch cart items
  const cartItems = await fetchCartItems(userId);

  if (!cartItems.length) {
    throw new Error("Cart is empty.");
  }

  // Calculate total price
  const totalPrice = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);

  // Create order
  const order = await Order.create({
    userId: new mongoose.Types.ObjectId(userId),
    paymentId: new mongoose.Types.ObjectId(paymentId),
    totalPrice,
    shippingAddress,
    orderedAt: new Date(),
  });

  // Create order items
  const orderItems = cartItems.map((cartItem) => ({
    orderId: order._id,
    productId: cartItem.productId,
    productSnapshot: cartItem.productSnapshot,
    quantity: cartItem.quantity,
    pricePerUnit: cartItem.productSnapshot.price,
    totalPrice: cartItem.totalPrice,
  }));

  // First store order items in the db and then clear user reservations (payment successful)
  await OrderItem.insertMany(orderItems);
  await Reservation.deleteMany({ userId });

  return order;
};

export { fetchAllUserOrders, fetchUserOrderById, createOrderAfterPayment };
