import { Router } from "express";
import { handleRole } from "../middlewares/roleHandler.js";
import { handleValidateToken } from "../middlewares/validateTokenHandler.js";
import {
  prepareCheckoutController,
  checkoutAddressController,
} from "../controllers/checkoutControllers.js";

const router = Router();

router
  .route("")
  .post(handleValidateToken, handleRole("USER"), prepareCheckoutController);

router
  .route("/address")
  .get(handleValidateToken, handleRole("USER"), checkoutAddressController);

export default router;
