import { successResponse } from "../utils/response.js";
import expressAsyncHandler from "express-async-handler";
import { fetchUserOrders, fetchOrderById } from "../services/orderServices.js";

/**
 * @description Fetch user's orders with pagination
 * @route GET /api/v1/profile/orders
 * @access private (role: USER)
 * @params ?page=1&perPage=10
 */
export const fetchUserOrdersController = expressAsyncHandler(async (req, res) => {
  const { orders, meta } = await fetchUserOrders(req.user.id, req.query);

  return successResponse(res, "Orders retrieved successfully.", { orders, meta });
});

/**
 * @description Fetch single order by ID
 * @route GET /api/v1/profile/orders/:orderId
 * @access private (role: USER)
 */
export const fetchOrderByIdController = expressAsyncHandler(async (req, res) => {
  try {
    const order = await fetchOrderById(req.user.id, req.params.orderId);
    return successResponse(res, "Order retrieved successfully.", order);
  } catch (error) {
    if (error.message === "Order not found.") {
      res.status(404);
      res.statusMessage = "Not Found";
    }
    throw error;
  }
});