import { successResponse } from "../utils/response.js";
import expressAsyncHandler from "express-async-handler";
import { fetchOrSaveActiveCart } from "../services/cartServices.js";

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

export { fetchOrSaveActiveCartController };
