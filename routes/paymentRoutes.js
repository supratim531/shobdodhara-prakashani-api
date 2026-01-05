import { Router } from "express";
import { handleRole } from "../middlewares/roleHandler.js";
import { handleValidateToken } from "../middlewares/validateTokenHandler.js";
import {
  verifyPaymentController,
  handleWebhookController,
} from "../controllers/paymentControllers.js";

const router = Router();

router
  .route("/verify")
  .post(handleValidateToken, handleRole("USER"), verifyPaymentController);

router.route("/webhook").post(handleWebhookController);

export default router;
