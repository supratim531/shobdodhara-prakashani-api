import mongoose from "mongoose";
import Order from "../models/orderModel.js";
import { getPaginationParams, buildMeta } from "../utils/pagination.js";

const fetchAllUserOrders = async (userId, query) => {
  const { page, perPage, skip } = getPaginationParams(query);

  const items = await Order.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
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
  ]);

  const totalItems = await Order.countDocuments({
    userId: new mongoose.Types.ObjectId(userId),
  });
  const meta = buildMeta({ totalItems, page, perPage, paginationLimit: 10 });

  return { items, meta };
};

const fetchUserOrderById = async (userId, orderId) => {
  const order = await Order.aggregate([
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

  if (!order.length) {
    throw new Error("Order not found.");
  }

  return order[0];
};

export { fetchAllUserOrders, fetchUserOrderById };
