import { successResponse } from "../utils/response.js";
import expressAsyncHandler from "express-async-handler";
import { saveProduct } from "../services/productServices.js";
import {
  CREATED,
  BAD_REQUEST,
  UNPROCESSABLE_ENTITY,
} from "../constants/statusCodes.js";
import {
  validateProductPayload,
  validateBookPayload,
  validateClothesPayload,
} from "../validators/productValidators.js";

/**
 * @description Save a new product with category-specific details
 * @route POST /api/v1/product
 * @access private (role: ADMIN)
 */
const saveProductController = expressAsyncHandler(async (req, res) => {
  let categoryValue = {};
  const { value: productValue, error: productError } = validateProductPayload(
    req.body
  );

  if (productError) {
    res.status(UNPROCESSABLE_ENTITY.code);
    res.statusMessage = UNPROCESSABLE_ENTITY.title;
    throw productError;
  }

  if (productValue.category === "BOOK") {
    const { value: bookValue, error: bookError } = validateBookPayload(
      req.body
    );

    if (bookError) {
      res.status(UNPROCESSABLE_ENTITY.code);
      res.statusMessage = UNPROCESSABLE_ENTITY.title;
      throw bookError;
    }

    categoryValue = bookValue;
  } else if (productValue.category === "CLOTHES") {
    const { value: clothesValue, error: clothesError } = validateClothesPayload(
      req.body
    );

    if (clothesError) {
      res.status(UNPROCESSABLE_ENTITY.code);
      res.statusMessage = UNPROCESSABLE_ENTITY.title;
      throw clothesError;
    }

    categoryValue = clothesValue;
  }

  try {
    const data = await saveProduct(productValue, categoryValue);

    return successResponse(
      res,
      "Product saved successfully!",
      data,
      CREATED.code
    );
  } catch (error) {
    res.status(BAD_REQUEST.code);
    res.statusMessage = BAD_REQUEST.title;
    throw error;
  }
});

export { saveProductController };
