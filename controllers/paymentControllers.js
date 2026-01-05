import { CREATED } from "../constants/statusCodes.js";
import { successResponse } from "../utils/response.js";
import expressAsyncHandler from "express-async-handler";
import { verifyPayment } from "../services/paymentServices.js";
import { validateVerifyPaymentPayload } from "../validators/paymentValidators.js";
import { UNPROCESSABLE_ENTITY, BAD_REQUEST } from "../constants/statusCodes.js";

/**
 * @description Verify payment after Razorpay verification
 * @route POST /api/v1/payment/verify
 * @access private (role: USER)
 */
const verifyPaymentController = expressAsyncHandler(async (req, res) => {
  const { value: paymentData, error } = validateVerifyPaymentPayload(req.body);

  if (error) {
    res.status(UNPROCESSABLE_ENTITY.code);
    res.statusMessage = UNPROCESSABLE_ENTITY.title;
    throw error;
  }

  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      shippingAddress,
    } = paymentData;

    const order = await verifyPayment(
      req.user.id,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
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
  } catch (error) {
    if (
      error.message.includes("signature") ||
      error.message.includes("verification")
    ) {
      res.status(BAD_REQUEST.code);
      res.statusMessage = BAD_REQUEST.title;
    }

    throw error;
  }
});

export { verifyPaymentController };
