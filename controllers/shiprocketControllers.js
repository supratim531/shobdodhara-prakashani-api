import AppLogger from "../utils/logger.js";
import { successResponse } from "../utils/response.js";
import expressAsyncHandler from "express-async-handler";
import { handleWebhook } from "../services/shiprocketServices.js";

/**
 * @description Handle Shiprocket webhook events
 * @route POST /api/v1/shipping/webhook
 * @access public
 */
const handleWebhookController = expressAsyncHandler(async (req, res) => {
  try {
    const result = await handleWebhook(req.body);

    return successResponse(res, "Webhook processed.", result);
  } catch (error) {
    AppLogger.error("Webhook processing error:", null, { error });

    // Always return 200 OK even on errors to prevent retries
    return successResponse(
      res,
      "Webhook processing failed!",
      {
        success: false,
        error,
      },
      200
    );
  }
});

export { handleWebhookController };
