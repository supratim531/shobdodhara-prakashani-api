import { Router } from "express";
import { handleRole } from "../middlewares/roleHandler.js";
import { handleValidateToken } from "../middlewares/validateTokenHandler.js";
import {
  fetchOrSaveActiveCartController,
  fetchCartItemsController,
  saveCartItemController,
  updateCartItemQuantityController,
  removeCartItemController,
  clearCartItemsController,
  refreshCartItemsController,
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
  .route("/refresh")
  .post(handleValidateToken, handleRole("USER"), refreshCartItemsController);

router
  .route("/items")
  .get(handleValidateToken, handleRole("USER"), fetchCartItemsController)
  .post(handleValidateToken, handleRole("USER"), saveCartItemController)
  .delete(handleValidateToken, handleRole("USER"), clearCartItemsController);

router
  .route("/items/:itemId")
  .patch(
    handleValidateToken,
    handleRole("USER"),
    updateCartItemQuantityController
  )
  .delete(handleValidateToken, handleRole("USER"), removeCartItemController);

export default router;
