import { successResponse } from "../utils/response.js";
import expressAsyncHandler from "express-async-handler";
import {
  CREATED,
  BAD_REQUEST,
  NOT_FOUND,
  UNPROCESSABLE_ENTITY,
} from "../constants/statusCodes.js";
import { prepareCheckout } from "../services/checkoutServices.js";
import { validatePrepareCheckoutPayload } from "../validators/checkoutValidators.js";

/**
 * @description Process checkout and create order
 * @route POST /api/v1/checkout
 * @access private (role: USER)
 */
const prepareCheckoutController = expressAsyncHandler(async (req, res) => {
  const { value: checkoutData, error } = validatePrepareCheckoutPayload(
    req.body
  );

  if (error) {
    res.status(UNPROCESSABLE_ENTITY.code);
    res.statusMessage = UNPROCESSABLE_ENTITY.title;
    throw error;
  }

  try {
    const { addressId } = checkoutData;
    const checkoutResult = await prepareCheckout(req.user.id, addressId);

    return successResponse(
      res,
      "Checkout completed successfully!",
      checkoutResult,
      CREATED.code
    );
  } catch (error) {
    if (
      error.message.includes("not found") ||
      error.message.includes("empty")
    ) {
      res.status(NOT_FOUND.code);
      res.statusMessage = NOT_FOUND.title;
    } else if (
      error.message.includes("left") ||
      error.message.includes("price") ||
      error.message.includes("available")
    ) {
      res.status(BAD_REQUEST.code);
      res.statusMessage = BAD_REQUEST.title;
    }

    throw error;
  }
});

export { prepareCheckoutController };
