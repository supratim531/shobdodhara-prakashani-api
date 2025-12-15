import { Router } from "express";
import { handleRole } from "../middlewares/roleHandler.js";
import { handleValidateToken } from "../middlewares/validateTokenHandler.js";
import { paymentSuccessController } from "../controllers/paymentControllers.js";

const router = Router();

router
  .route("/success")
  .post(handleValidateToken, handleRole("USER"), paymentSuccessController);

export default router;
