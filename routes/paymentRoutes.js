import { Router } from "express";
import { handleRole } from "../middlewares/roleHandler.js";
import { handleValidateToken } from "../middlewares/validateTokenHandler.js";
import { processPaymentSuccessController } from "../controllers/paymentControllers.js";

const router = Router();

router
  .route("/success")
  .post(
    handleValidateToken,
    handleRole("USER"),
    processPaymentSuccessController
  );

export default router;
