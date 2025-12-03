import { Router } from "express";
import { handleRole } from "../middlewares/roleHandler.js";
import { handleValidateToken } from "../middlewares/validateTokenHandler.js";
import {
  fetchOrSaveActiveCartController,
  fetchCartItemsController,
  saveCartItemController,
} from "../controllers/cartControllers.js";

const router = Router();

router
  .route("")
  .get(
    handleValidateToken,
    handleRole("USER"),
    fetchOrSaveActiveCartController
  );

router
  .route("/items")
  .get(handleValidateToken, handleRole("USER"), fetchCartItemsController)
  .post(handleValidateToken, handleRole("USER"), saveCartItemController);

export default router;
