import { Router } from "express";
import { handleRole } from "../middlewares/roleHandler.js";
import { handleValidateToken } from "../middlewares/validateTokenHandler.js";
import { verifyPaymentController } from "../controllers/paymentControllers.js";

const router = Router();

router
  .route("/verify")
  .post(handleValidateToken, handleRole("USER"), verifyPaymentController);

export default router;
