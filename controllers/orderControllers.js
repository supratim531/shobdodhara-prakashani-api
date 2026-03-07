import AppLogger from "../utils/logger.js";
import { successResponse } from "../utils/response.js";
import expressAsyncHandler from "express-async-handler";
import {
  trackShipment,
  getShipmentStatus,
  generateLabel,
} from "../services/shiprocketServices.js";
import { validateGenerateOrderLabelPayload } from "../validators/orderValidators.js";
import {
  NOT_FOUND,
  INTERNAL_SERVER_ERROR,
  BAD_REQUEST,
} from "../constants/statusCodes.js";
import {
  fetchAllOrders,
  fetchAllUserOrders,
  fetchUserOrderById,
  updateOrderShippingStatus,
} from "../services/orderServices.js";

/**
 * @description Fetch all orders with pagination (Admin)
 * @route GET /api/v1/order/all
 * @access private (role: ADMIN)
 */
const fetchAllOrdersController = expressAsyncHandler(async (req, res) => {
  const { items, meta } = await fetchAllOrders(req.query);

  return successResponse(res, "All orders retrieved successfully.", {
    items,
    meta,
  });
});

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

/**
 * @description Track order delivery status
 * @route GET /api/v1/order/:orderId/track
 * @access private (role: USER)
 */
const trackOrderController = expressAsyncHandler(async (req, res) => {
  try {
    // First get the order to verify ownership and get tracking details
    const order = await fetchUserOrderById(req.user.id, req.params.orderId);

    if (!order.shiprocketOrderId && !order.awbCode) {
      res.status(BAD_REQUEST.code);
      res.statusMessage = BAD_REQUEST.title;
      throw new Error(
        "Order tracking not available. Order may not be shipped yet.",
      );
    }

    let trackingData = null;

    try {
      if (order.awbCode) {
        // Use AWB code for detailed tracking
        trackingData = await trackShipment(order.awbCode);
      } else if (order.shiprocketOrderId) {
        // Fallback to order status
        trackingData = await getShipmentStatus(order.shiprocketOrderId);
      }

      // Update order with fresh tracking data
      if (trackingData) {
        AppLogger.info("trackingData response:", { trackingData });
        await updateOrderShippingStatus(req.params.orderId, {
          tracking_url: trackingData.tracking_data.track_url,
          track_activities:
            trackingData.tracking_data.shipment_track_activities,
          shiprocket_status:
            trackingData.tracking_data.shipment_track[0].current_status.toUpperCase(),
        });
      }
    } catch (trackingError) {
      AppLogger.error("Shiprocket tracking error:", trackingError, {
        trackingError,
      });
      // Continue with existing order data if tracking fails
    }

    // Get updated order data
    const updatedOrder = await fetchUserOrderById(
      req.user.id,
      req.params.orderId,
    );

    const trackingInfo = {
      orderId: updatedOrder._id,
      status: updatedOrder.status,
      shiprocketStatus: updatedOrder.shiprocketStatus,
      awbCode: updatedOrder.awbCode,
      courierCompany: updatedOrder.courierCompany,
      trackingUrl: updatedOrder.trackingUrl,
      deliveredAt: updatedOrder.deliveredAt,
      lastStatusUpdate: updatedOrder.lastStatusUpdate,
      trackingData: trackingData || null,
    };

    return successResponse(
      res,
      "Order tracking information retrieved.",
      trackingInfo,
    );
  } catch (error) {
    if (error.message === "Order not found.") {
      res.status(NOT_FOUND.code);
      res.statusMessage = NOT_FOUND.title;
    } else if (error.message.includes("tracking not available")) {
      res.status(BAD_REQUEST.code);
      res.statusMessage = BAD_REQUEST.title;
    } else {
      res.status(INTERNAL_SERVER_ERROR.code);
      res.statusMessage = INTERNAL_SERVER_ERROR.title;
    }

    throw error;
  }
});

/**
 * @description Generate label for single/multiple orders
 * @route POST /api/v1/order/generate/label
 * @access private (role: ADMIN)
 */
const generateOrderLabelController = expressAsyncHandler(async (req, res) => {
  const { value: data, error } = validateGenerateOrderLabelPayload(req.body);

  if (error) {
    res.status(UNPROCESSABLE_ENTITY.code);
    res.statusMessage = UNPROCESSABLE_ENTITY.title;
    throw error;
  }

  try {
    const result = await generateLabel(...data.shiprocketShipmentIds);

    return successResponse(
      res,
      "Fetched generated label for selected order(s).",
      result,
    );
  } catch (error) {
    if (error.message?.includes("Could not generate label")) {
      res.status(NOT_FOUND.code);
      res.statusMessage = NOT_FOUND.title;
    } else {
      res.status(BAD_REQUEST.code);
      res.statusMessage = BAD_REQUEST.title;
    }

    throw error;
  }
});

export {
  fetchAllOrdersController,
  fetchAllUserOrdersController,
  fetchUserOrderByIdController,
  trackOrderController,
  generateOrderLabelController,
};
