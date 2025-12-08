import { successResponse } from "../utils/response.js";
import expressAsyncHandler from "express-async-handler";
import {
  CREATED,
  NOT_FOUND,
  UNPROCESSABLE_ENTITY,
  INTERNAL_SERVER_ERROR,
} from "../constants/statusCodes.js";
import {
  validateSaveCartItemPayload,
  validateUpdateCartItemQuantityPayload,
} from "../validators/cartValidators.js";
import {
  fetchOrSaveActiveCart,
  fetchCartItems,
  saveCartItem,
  updateCartItemQuantity,
  removeCartItem,
  clearCartItems,
  refreshCartItems,
  fetchCartSummary,
  applyCouponToCart,
  removeCouponFromCart,
  reactivateCart,
} from "../services/cartServices.js";

/**
 * @description Get or create user's active cart
 * @route GET /api/v1/cart
 * @access private (role: USER)
 */
const fetchOrSaveActiveCartController = expressAsyncHandler(
  async (req, res) => {
    const cart = await fetchOrSaveActiveCart(req.user.id);

    return successResponse(res, "Cart retrieved successfully.", cart);
  }
);

/**
 * @description Fetch cart items for user's active cart
 * @route GET /api/v1/cart/items
 * @access private (role: USER)
 */
const fetchCartItemsController = expressAsyncHandler(async (req, res) => {
  const cartItems = await fetchCartItems(req.user.id);

  return successResponse(res, "Cart items retrieved successfully.", cartItems);
});

/**
 * @description Add product to cart
 * @route POST /api/v1/cart/items
 * @access private (role: USER)
 */
const saveCartItemController = expressAsyncHandler(async (req, res) => {
  const { value: cartItemData, error } = validateSaveCartItemPayload(req.body);

  if (error) {
    res.status(UNPROCESSABLE_ENTITY.code);
    res.statusMessage = UNPROCESSABLE_ENTITY.title;
    throw error;
  }

  try {
    const { productId, quantity } = cartItemData;
    const { item, notification } = await saveCartItem(
      req.user.id,
      productId,
      quantity
    );

    return successResponse(
      res,
      "Product added to cart!",
      { item, notification },
      CREATED.code
    );
  } catch (error) {
    if (error.message === "Product not found.") {
      res.status(NOT_FOUND.code);
      res.statusMessage = NOT_FOUND.title;
    } else {
      res.status(INTERNAL_SERVER_ERROR.code);
      res.statusMessage = INTERNAL_SERVER_ERROR.title;
    }

    throw error;
  }
});

/**
 * @description Update cart item quantity
 * @route PATCH /api/v1/cart/items/:itemId
 * @access private (role: USER)
 */
const updateCartItemQuantityController = expressAsyncHandler(
  async (req, res) => {
    const { value: updateData, error } = validateUpdateCartItemQuantityPayload(
      req.body
    );

    if (error) {
      res.status(UNPROCESSABLE_ENTITY.code);
      res.statusMessage = UNPROCESSABLE_ENTITY.title;
      throw error;
    }

    try {
      const { itemId } = req.params;
      const { quantity } = updateData;
      const { item, notification } = await updateCartItemQuantity(
        req.user.id,
        itemId,
        quantity
      );

      return successResponse(res, "Cart item quantity updated!", {
        item,
        notification,
      });
    } catch (error) {
      if (error.message === "Cart item not found.") {
        res.status(NOT_FOUND.code);
        res.statusMessage = NOT_FOUND.title;
      } else {
        res.status(INTERNAL_SERVER_ERROR.code);
        res.statusMessage = INTERNAL_SERVER_ERROR.title;
      }

      throw error;
    }
  }
);

/**
 * @description Remove cart item
 * @route DELETE /api/v1/cart/items/:itemId
 * @access private (role: USER)
 */
const removeCartItemController = expressAsyncHandler(async (req, res) => {
  try {
    const { itemId } = req.params;
    const data = await removeCartItem(req.user.id, itemId);

    return successResponse(res, "Cart item removed!", data);
  } catch (error) {
    if (error.message === "Cart item not found.") {
      res.status(NOT_FOUND.code);
      res.statusMessage = NOT_FOUND.title;
    } else {
      res.status(INTERNAL_SERVER_ERROR.code);
      res.statusMessage = INTERNAL_SERVER_ERROR.title;
    }

    throw error;
  }
});

/**
 * @description Clear all cart items
 * @route DELETE /api/v1/cart/items
 * @access private (role: USER)
 */
const clearCartItemsController = expressAsyncHandler(async (req, res) => {
  const data = await clearCartItems(req.user.id);

  return successResponse(res, "All items are removed!", data);
});

/**
 * @description Refresh cart prices and stock check
 * @route POST /api/v1/cart/refresh
 * @access private (role: USER)
 */
const refreshCartItemsController = expressAsyncHandler(async (req, res) => {
  const refreshedCartItems = await refreshCartItems(req.user.id);

  return successResponse(res, "Cart refreshed successfully!", {
    ...refreshedCartItems,
  });
});

/**
 * @description Get cart summary including subtotal, discounts, tax estimate, shipping, and item count
 * @route GET /api/v1/cart/summary
 * @access private (role: USER)
 */
const fetchCartSummaryController = expressAsyncHandler(async (req, res) => {
  const cartSummary = await fetchCartSummary(req.user.id);

  return successResponse(res, "Cart summary fetched.", cartSummary);
});

/**
 * @description Apply coupon to user's cart and return updated summary
 * @route PATCH /api/v1/cart/coupon/:code
 * @access private (role: USER)
 */
const applyCouponToCartController = expressAsyncHandler(async (req, res) => {
  const { code } = req.params;
  const updatedCartSummary = await applyCouponToCart(req.user.id, code);

  return successResponse(
    res,
    "Coupon applied to the cart.",
    updatedCartSummary
  );
});

/**
 * @description Remove coupon from user's cart and return updated summary
 * @route DELETE /api/v1/cart/coupon
 * @access private (role: USER)
 */
const removeCouponFromCartController = expressAsyncHandler(async (req, res) => {
  const updatedCartSummary = await removeCouponFromCart(req.user.id);

  return successResponse(
    res,
    "Coupon removed from the cart.",
    updatedCartSummary
  );
});

/**
 * @description Reactivate abandoned cart
 * @route POST /api/v1/cart/reactivate
 * @access private (role: USER)
 */
const reactivateCartController = expressAsyncHandler(async (req, res) => {
  const data = await reactivateCart(req.user.id);

  return successResponse(res, "Cart reactivated successfully!", data);
});

export {
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
};
