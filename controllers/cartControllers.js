import { successResponse } from "../utils/response.js";
import expressAsyncHandler from "express-async-handler";
import {
  CREATED,
  NOT_FOUND,
  UNPROCESSABLE_ENTITY,
  INTERNAL_SERVER_ERROR,
} from "../constants/statusCodes.js";
import {
  validateSaveCartItem,
  validateUpdateCartItemQuantity,
} from "../validators/cartValidators.js";
import {
  fetchOrSaveActiveCart,
  fetchCartItems,
  saveCartItem,
  updateCartItemQuantity,
  removeCartItem,
  clearCartItems,
  refreshCartItems,
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
  const { value: cartItemData, error } = validateSaveCartItem(req.body);

  if (error) {
    res.status(UNPROCESSABLE_ENTITY.code);
    res.statusMessage = UNPROCESSABLE_ENTITY.title;
    throw error;
  }

  try {
    const { productId, quantity } = cartItemData;
    const cartItem = await saveCartItem(req.user.id, productId, quantity);

    return successResponse(
      res,
      "Product added to cart!",
      cartItem,
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
    const { value: updateData, error } = validateUpdateCartItemQuantity(
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
      const cartItem = await updateCartItemQuantity(
        req.user.id,
        itemId,
        quantity
      );

      return successResponse(res, "Cart item quantity updated!", cartItem);
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
    const removedCartItem = await removeCartItem(req.user.id, itemId);

    return successResponse(res, "Cart item removed!", removedCartItem);
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
  const refreshedData = await refreshCartItems(req.user.id);

  return successResponse(res, "Cart refreshed successfully!", refreshedData);
});

export {
  fetchOrSaveActiveCartController,
  fetchCartItemsController,
  saveCartItemController,
  updateCartItemQuantityController,
  removeCartItemController,
  clearCartItemsController,
  refreshCartItemsController,
};
