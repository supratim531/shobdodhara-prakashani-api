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
  fetchCartSummaryController,
  applyCouponToCartController,
  removeCouponFromCartController,
  reactivateCartController,
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

router
  .route("/refresh")
  .post(handleValidateToken, handleRole("USER"), refreshCartItemsController);

router
  .route("/summary")
  .get(handleValidateToken, handleRole("USER"), fetchCartSummaryController);

router
  .route("/coupon")
  .delete(
    handleValidateToken,
    handleRole("USER"),
    removeCouponFromCartController
  );

router
  .route("/coupon/:code")
  .patch(handleValidateToken, handleRole("USER"), applyCouponToCartController);

router
  .route("/reactivate")
  .post(handleValidateToken, handleRole("USER"), reactivateCartController);

export default router;
