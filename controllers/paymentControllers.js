import { successResponse } from "../utils/response.js";
import expressAsyncHandler from "express-async-handler";

/**
 * @description Dummy payment success handler
 * @route POST /api/v1/payment/success
 * @access private (role: USER)
 */
const paymentSuccessController = expressAsyncHandler(async (req, res) => {
  // TODO: Implement order creation and Shiprocket integration

  return successResponse(res, "Payment successful. Order will be processed.", {
    paymentId: req.body.paymentId,
    userId: req.user.id,
  });
});

export { paymentSuccessController };
