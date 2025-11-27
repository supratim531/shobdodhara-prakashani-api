import Book from "../models/bookModel.js";
import Clothes from "../models/clothesModel.js";
import Product from "../models/productModel.js";
import { successResponse } from "../utils/response.js";
import expressAsyncHandler from "express-async-handler";
import { saveProduct } from "../services/productServices.js";
import {
  CREATED,
  BAD_REQUEST,
  UNPROCESSABLE_ENTITY,
} from "../constants/statusCodes.js";
import {
  validateSaveProductPayload,
  validateSaveBookPayload,
  validateSaveClothesPayload,
} from "../validators/productValidators.js";

/**
 * @description Return a new object containing only keys from `payload` that exist in the mongooseModel's schema.
 * @param {Object} payload - source object with many keys
 * @param {mongoose.Model} mongooseModel - Mongoose model (e.g., Product, Book, Clothes)
 * @returns {Object} filtered object with only schema keys
 */
const pickBySchema = (payload, mongooseModel) => {
  if (!payload || typeof payload !== "object") return {};
  if (!mongooseModel || !mongooseModel.schema) return {};

  const schemaKeys = Object.keys(mongooseModel.schema.paths).filter(
    (k) => !k.startsWith("_") && k !== "__v"
  );

  return schemaKeys.reduce((out, key) => {
    if (Object.prototype.hasOwnProperty.call(payload, key)) {
      out[key] = payload[key];
    }
    return out;
  }, {});
};

/**
 * @description Save a new product with category-specific details
 * @route POST /api/v1/product
 * @access private (role: ADMIN)
 */
const saveProductController = expressAsyncHandler(async (req, res) => {
  let categoryData = {};
  const bookPayload = pickBySchema(req.body, Book);
  const clothesPayload = pickBySchema(req.body, Clothes);
  const productPayload = pickBySchema(req.body, Product);

  const { value: productData, error: productError } =
    validateSaveProductPayload(productPayload);

  if (productError) {
    res.status(UNPROCESSABLE_ENTITY.code);
    res.statusMessage = UNPROCESSABLE_ENTITY.title;
    throw productError;
  }

  if (productData.category === "BOOK") {
    const { value: bookData, error: bookError } =
      validateSaveBookPayload(bookPayload);

    if (bookError) {
      res.status(UNPROCESSABLE_ENTITY.code);
      res.statusMessage = UNPROCESSABLE_ENTITY.title;
      throw bookError;
    }

    categoryData = bookData;
  } else if (productData.category === "CLOTHES") {
    const { value: clothesData, error: clothesError } =
      validateSaveClothesPayload(clothesPayload);

    if (clothesError) {
      res.status(UNPROCESSABLE_ENTITY.code);
      res.statusMessage = UNPROCESSABLE_ENTITY.title;
      throw clothesError;
    }

    categoryData = clothesData;
  }

  try {
    const data = await saveProduct(productData, categoryData);

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
