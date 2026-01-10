import { Router } from "express";
import { handleRole } from "../middlewares/roleHandler.js";
import { handleValidateToken } from "../middlewares/validateTokenHandler.js";
import {
  verifyPaymentController,
  handleWebhookController,
  processPaymentSuccessController,
} from "../controllers/paymentControllers.js";

const router = Router();

router
  .route("/verify")
  .post(handleValidateToken, handleRole("USER"), verifyPaymentController);

router.route("/webhook").post(handleWebhookController);

router
  .route("/success")
  .post(
    handleValidateToken,
    handleRole("USER"),
    processPaymentSuccessController
  );

export default router;
