import Order from "../models/orderModel.js";
import OrderItem from "../models/orderItemModel.js";
import { getPaginationParams, buildMeta } from "../utils/pagination.js";
import mongoose from "mongoose";

export const fetchUserOrders = async (userId, query) => {
  const { page, perPage, skip } = getPaginationParams(query);

  const orders = await Order.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    { $sort: { orderedAt: -1 } },
    { $skip: skip },
    { $limit: perPage },
    {
      $lookup: {
        from: "orderitems",
        localField: "_id",
        foreignField: "orderId",
        as: "items"
      }
    },
    {
      $project: {
        __v: 0,
        "items.__v": 0,
      }
    }
  ]);

  const totalItems = await Order.countDocuments({ userId: new mongoose.Types.ObjectId(userId) });
  const meta = buildMeta({ totalItems, page, perPage });

  return { orders, meta };
};

export const fetchOrderById = async (userId, orderId) => {
  const order = await Order.aggregate([
    { 
      $match: { 
        _id: new mongoose.Types.ObjectId(orderId),
        userId: new mongoose.Types.ObjectId(userId)
      }
    },
    {
      $lookup: {
        from: "orderitems",
        localField: "_id",
        foreignField: "orderId",
        as: "items"
      }
    },
    {
      $project: {
        __v: 0,
        "items.__v": 0,
        "items.orderId": 0
      }
    }
  ]);

  if (!order.length) {
    throw new Error("Order not found.");
  }

  return order[0];
};