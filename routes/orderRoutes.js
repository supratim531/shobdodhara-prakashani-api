import { Router } from "express";
import { handleRole } from "../middlewares/roleHandler.js";
import { handleValidateToken } from "../middlewares/validateTokenHandler.js";
import {
  fetchAllUserOrdersController,
  fetchUserOrderByIdController,
  trackOrderController,
} from "../controllers/orderControllers.js";

const router = Router();

router
  .route("")
  .get(handleValidateToken, handleRole("USER"), fetchAllUserOrdersController);

router
  .route("/:orderId")
  .get(handleValidateToken, handleRole("USER"), fetchUserOrderByIdController);

router
  .route("/:orderId/track")
  .get(handleValidateToken, handleRole("USER"), trackOrderController);

export default router;
