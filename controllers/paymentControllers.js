import { CREATED } from "../constants/statusCodes.js";
import { successResponse } from "../utils/response.js";
import expressAsyncHandler from "express-async-handler";
import { processPaymentSuccess } from "../services/paymentServices.js";

/**
 * @description Dummy payment success handler
 * @route POST /api/v1/payment/success
 * @access private (role: USER)
 */
const processPaymentSuccessController = expressAsyncHandler(
  async (req, res) => {
    const { paymentId, shippingAddress } = req.body;
    const order = await processPaymentSuccess(
      req.user.id,
      paymentId,
      shippingAddress
    );

    return successResponse(
      res,
      "Payment successful. Order created successfully.",
      {
        orderId: order._id,
        totalPrice: order.totalPrice,
      },
      CREATED.code
    );
  }
);

export { processPaymentSuccessController };
