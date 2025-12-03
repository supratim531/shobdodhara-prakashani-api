import { successResponse } from "../utils/response.js";
import expressAsyncHandler from "express-async-handler";
import { CREATED, UNPROCESSABLE_ENTITY } from "../constants/statusCodes.js";
import { validateSaveCartItem } from "../validators/cartValidators.js";
import {
  fetchOrSaveActiveCart,
  fetchCartItems,
  saveCartItem,
} from "../services/cartServices.js";

/**
 * @description Get or create user's active cart
 * @route GET /api/cart
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
 * @route GET /api/cart/items
 * @access private (role: USER)
 */
const fetchCartItemsController = expressAsyncHandler(async (req, res) => {
  const cartItems = await fetchCartItems(req.user.id);

  return successResponse(res, "Cart items retrieved successfully.", cartItems);
});

/**
 * @description Add product to cart
 * @route POST /api/cart/items
 * @access private
 */
const saveCartItemController = expressAsyncHandler(async (req, res) => {
  const { value: cartItemData, error } = validateSaveCartItem(req.body);

  if (error) {
    res.status(UNPROCESSABLE_ENTITY.code);
    res.statusMessage = UNPROCESSABLE_ENTITY.title;
    throw error;
  }

  const { productId, quantity } = cartItemData;
  const cartItem = await saveCartItem(req.user.id, productId, quantity);

  return successResponse(res, "Product added to cart!", cartItem, CREATED.code);
});

export {
  fetchOrSaveActiveCartController,
  fetchCartItemsController,
  saveCartItemController,
};
