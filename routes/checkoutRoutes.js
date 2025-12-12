import { Router } from "express";
import { handleRole } from "../middlewares/roleHandler.js";
import { handleValidateToken } from "../middlewares/validateTokenHandler.js";
import { prepareCheckoutController } from "../controllers/checkoutControllers.js";

const router = Router();

router
  .route("")
  .post(handleValidateToken, handleRole("USER"), prepareCheckoutController);

export default router;
