import { Router } from "express";
import { handleRole } from "../middlewares/roleHandler.js";
import { handleValidateToken } from "../middlewares/validateTokenHandler.js";
import {
  fetchAllUserOrdersController,
  fetchUserOrderByIdController,
} from "../controllers/orderControllers.js";

const router = Router();

router
  .route("")
  .get(handleValidateToken, handleRole("USER"), fetchAllUserOrdersController);

router
  .route("/:orderId")
  .get(handleValidateToken, handleRole("USER"), fetchUserOrderByIdController);

export default router;
