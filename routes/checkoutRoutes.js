import { Router } from "express";
import { handleRole } from "../middlewares/roleHandler.js";
import { handleValidateToken } from "../middlewares/validateTokenHandler.js";
import { checkoutRefreshController } from "../controllers/checkoutControllers.js";

const router = Router();

router
  .route("/refresh")
  .post(handleValidateToken, handleRole("USER"), checkoutRefreshController);

export default router;
