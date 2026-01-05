import { successResponse } from "../utils/response.js";
import expressAsyncHandler from "express-async-handler";
import { verifyPayment, handleWebhook } from "../services/paymentServices.js";
import {
  CREATED,
  BAD_REQUEST,
  UNPROCESSABLE_ENTITY,
} from "../constants/statusCodes.js";
import {
  validateVerifyPaymentPayload,
  validateHandleWebhookPayload,
} from "../validators/paymentValidators.js";

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

/**
 * @description Handle Razorpay webhook events
 * @route POST /api/v1/payment/webhook
 * @access public
 */
const handleWebhookController = expressAsyncHandler(async (req, res) => {
  const webhookSignature = req.headers["x-razorpay-signature"];

  if (!webhookSignature) {
    res.status(BAD_REQUEST.code);
    res.statusMessage = BAD_REQUEST.title;
    throw new Error("Missing webhook signature");
  }

  const { value: webhookData, error } = validateHandleWebhookPayload(req.body);

  if (error) {
    res.status(UNPROCESSABLE_ENTITY.code);
    res.statusMessage = UNPROCESSABLE_ENTITY.title;
    throw error;
  }

  try {
    const result = await handleWebhook(webhookData, webhookSignature);

    return successResponse(res, "Webhook processed successfully", result);
  } catch (error) {
    if (error.message.includes("signature")) {
      res.status(BAD_REQUEST.code);
      res.statusMessage = BAD_REQUEST.title;
    }

    throw error;
  }
});

export { verifyPaymentController, handleWebhookController };
