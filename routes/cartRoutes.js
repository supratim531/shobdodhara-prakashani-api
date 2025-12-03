import { Router } from "express";
import { handleRole } from "../middlewares/roleHandler.js";
import { handleValidateToken } from "../middlewares/validateTokenHandler.js";
import {
  fetchOrSaveActiveCartController,
  fetchCartItemsController,
  saveCartItemController,
  updateCartItemQuantityController,
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

router
  .route("/items/:itemId")
  .patch(
    handleValidateToken,
    handleRole("USER"),
    updateCartItemQuantityController
  );

export default router;
