import { cacheInvalidate } from "../utils/cache.js";
import { successResponse } from "../utils/response.js";
import expressAsyncHandler from "express-async-handler";
import { validateVerifyPaymentPayload } from "../validators/paymentValidators.js";
import {
  CREATED,
  BAD_REQUEST,
  UNPROCESSABLE_ENTITY,
} from "../constants/statusCodes.js";
import {
  verifyPayment,
  handleWebhook,
  processPaymentSuccess,
} from "../services/paymentServices.js";

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
      totalAmount,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      shippingAddress,
      courierId,
    } = paymentData;
    const data = await verifyPayment(
      req.user.id,
      totalAmount,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      shippingAddress,
      courierId,
    );
    await cacheInvalidate(["api:v1:product*"]);

    return successResponse(
      res,
      "Payment successful. Order created successfully.",
      data,
      CREATED.code,
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

  try {
    const result = await handleWebhook(req.body, webhookSignature);

    return successResponse(res, "Webhook processed.", result);
  } catch (error) {
    if (error.message.includes("signature")) {
      res.status(BAD_REQUEST.code);
      res.statusMessage = BAD_REQUEST.title;
    }

    throw error;
  }
});

/**
 * @description Dummy payment success handler
 * @route POST /api/v1/payment/success
 * @access private (role: USER)
 */
const processPaymentSuccessController = expressAsyncHandler(
  async (req, res) => {
    const { paymentId, shippingAddress, courierId } = req.body;
    const data = await processPaymentSuccess(
      req.user.id,
      paymentId,
      shippingAddress,
      courierId,
    );
    await cacheInvalidate(["api:v1:product*"]);

    return successResponse(
      res,
      "Payment successful. Order created successfully.",
      data,
      CREATED.code,
    );
  },
);

export {
  verifyPaymentController,
  handleWebhookController,
  processPaymentSuccessController,
};
