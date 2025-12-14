import { successResponse } from "../utils/response.js";
import expressAsyncHandler from "express-async-handler";
import { NOT_FOUND, INTERNAL_SERVER_ERROR } from "../constants/statusCodes.js";
import {
  fetchAllUserOrders,
  fetchUserOrderById,
} from "../services/orderServices.js";

/**
 * @description Fetch user's orders with pagination
 * @route GET /api/v1/order
 * @access private (role: USER)
 */
const fetchAllUserOrdersController = expressAsyncHandler(async (req, res) => {
  const { items, meta } = await fetchAllUserOrders(req.user.id, req.query);

  return successResponse(res, "All orders retrieved successfully.", {
    items,
    meta,
  });
});

/**
 * @description Fetch single order by ID
 * @route GET /api/v1/order/:orderId
 * @access private (role: USER)
 */
const fetchUserOrderByIdController = expressAsyncHandler(async (req, res) => {
  try {
    const order = await fetchUserOrderById(req.user.id, req.params.orderId);

    return successResponse(res, "Order retrieved successfully.", order);
  } catch (error) {
    if (error.message === "Order not found.") {
      res.status(NOT_FOUND.code);
      res.statusMessage = NOT_FOUND.title;
    } else {
      res.status(INTERNAL_SERVER_ERROR.code);
      res.statusMessage = INTERNAL_SERVER_ERROR.title;
    }

    throw error;
  }
});

export { fetchAllUserOrdersController, fetchUserOrderByIdController };
