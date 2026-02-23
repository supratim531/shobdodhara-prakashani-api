import { cacheInvalidate } from "../utils/cache.js";
import { successResponse } from "../utils/response.js";
import expressAsyncHandler from "express-async-handler";
import {
  prepareCheckout,
  checkoutAddress,
} from "../services/checkoutServices.js";
import {
  CREATED,
  BAD_REQUEST,
  NOT_FOUND,
  UNPROCESSABLE_ENTITY,
} from "../constants/statusCodes.js";
import {
  validatePrepareCheckoutPayload,
  validateCheckoutAddressPayload,
} from "../validators/checkoutValidators.js";

/**
 * @description Process checkout and create order
 * @route POST /api/v1/checkout
 * @access private (role: USER)
 */
const prepareCheckoutController = expressAsyncHandler(async (req, res) => {
  const { value: checkoutData, error } = validatePrepareCheckoutPayload(
    req.body,
  );

  if (error) {
    res.status(UNPROCESSABLE_ENTITY.code);
    res.statusMessage = UNPROCESSABLE_ENTITY.title;
    throw error;
  }

  try {
    const { addressId, shippingCost } = checkoutData;
    const checkoutResult = await prepareCheckout(
      req.user.id,
      addressId,
      shippingCost,
    );
    await cacheInvalidate(["api:v1:product*"]);

    return successResponse(
      res,
      "Checkout completed successfully!",
      checkoutResult,
      CREATED.code,
    );
  } catch (error) {
    console.error(error);
    console.log("Checkout error:");
    console.dir(error, { depth: null });

    if (
      error.message?.includes("not found") ||
      error.message?.includes("empty")
    ) {
      res.status(NOT_FOUND.code);
      res.statusMessage = NOT_FOUND.title;
    } else if (
      error.message?.includes("left") ||
      error.message?.includes("price") ||
      error.message?.includes("available")
    ) {
      res.status(BAD_REQUEST.code);
      res.statusMessage = BAD_REQUEST.title;
    }

    throw error;
  }
});

/**
 * @description Check courier serviceability based on the delivery (pincode) address
 * @route GET /api/v1/checkout/address
 * @access private (role: USER)
 */
const checkoutAddressController = expressAsyncHandler(async (req, res) => {
  const { value: addressData, error } = validateCheckoutAddressPayload(
    req.query,
  );

  if (error) {
    res.status(UNPROCESSABLE_ENTITY.code);
    res.statusMessage = UNPROCESSABLE_ENTITY.title;
    throw error;
  }

  try {
    const {
      deliveryPostcode,
      maxLength,
      maxBreadth,
      totalHeight,
      totalWeight,
      cod,
    } = addressData;
    const result = await checkoutAddress(
      deliveryPostcode,
      maxLength,
      maxBreadth,
      totalHeight,
      totalWeight,
      cod,
    );

    return successResponse(res, "Courier serviceability checked!", result);
  } catch (error) {
    if (error.message?.includes("serviceability")) {
      res.status(BAD_REQUEST.code);
      res.statusMessage = BAD_REQUEST.title;
    }

    throw error;
  }
});

export { prepareCheckoutController, checkoutAddressController };
