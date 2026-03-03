import Book from "../models/bookModel.js";
import Clothes from "../models/clothesModel.js";
import Product from "../models/productModel.js";
import { successResponse } from "../utils/response.js";
import expressAsyncHandler from "express-async-handler";
import {
  withCache,
  generateCacheKey,
  cacheInvalidate,
} from "../utils/cache.js";
import {
  saveProduct,
  fetchAllProducts,
  fetchProductById,
  updateProduct,
  deleteProduct,
  deleteAllProducts,
  deleteProducts,
} from "../services/productServices.js";
import {
  CREATED,
  BAD_REQUEST,
  NOT_FOUND,
  UNPROCESSABLE_ENTITY,
  INTERNAL_SERVER_ERROR,
} from "../constants/statusCodes.js";
import {
  validateSaveProductPayload,
  validateSaveBookPayload,
  validateSaveClothesPayload,
  validateUpdateProductPayload,
  validateUpdateBookPayload,
  validateUpdateClothesPayload,
  validateDeleteProductsPayload,
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
    (k) => !k.startsWith("_") && k !== "__v",
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
    await cacheInvalidate(["api:v1:product*"]);

    return successResponse(
      res,
      "Product saved successfully!",
      data,
      CREATED.code,
    );
  } catch (error) {
    res.status(BAD_REQUEST.code);
    res.statusMessage = BAD_REQUEST.title;
    throw error;
  }
});

/**
 * @description Get all products with sort and filter feature
 * @route GET /api/v1/product
 * @access public
 */
const fetchAllProductsController = expressAsyncHandler(async (req, res) => {
  const cachedFetchAllProducts = withCache(fetchAllProducts, {
    keyGenerator: () => generateCacheKey(req),
    ttl: 300,
  });

  try {
    const { items, meta } = await cachedFetchAllProducts(req.query);

    return successResponse(res, "All products fetched.", { items, meta });
  } catch (error) {
    if (error.message === "Invalid category") {
      res.status(BAD_REQUEST.code);
      res.statusMessage = BAD_REQUEST.title;
    } else {
      res.status(INTERNAL_SERVER_ERROR.code);
      res.statusMessage = INTERNAL_SERVER_ERROR.title;
    }

    throw error;
  }
});

/**
 * @description Get an existing product by its id
 * @route PATCH /api/v1/product/:productId
 * @access public
 */
const fetchProductByIdController = expressAsyncHandler(async (req, res) => {
  const cachedFetchProductById = withCache(fetchProductById, {
    keyGenerator: () => generateCacheKey(req),
    ttl: 300,
  });

  try {
    const item = await cachedFetchProductById(req.params.productId);

    return successResponse(res, "Product fetched.", item);
  } catch (error) {
    if (error.message === "Product not found.") {
      res.status(NOT_FOUND.code);
      res.statusMessage = NOT_FOUND.title;
    } else if (error.message === "Invalid category found!") {
      res.status(BAD_REQUEST.code);
      res.statusMessage = BAD_REQUEST.title;
    } else {
      res.status(INTERNAL_SERVER_ERROR.code);
      res.statusMessage = INTERNAL_SERVER_ERROR.title;
    }

    throw error;
  }
});

/**
 * @description Update an existing product with category-specific details
 * @route PATCH /api/v1/product/:productId
 * @access private (role: ADMIN)
 */
const updateProductController = expressAsyncHandler(async (req, res) => {
  let categoryData = {};
  const { bookId, clothesId } = req.query;
  const bookPayload = pickBySchema(req.body, Book);
  const clothesPayload = pickBySchema(req.body, Clothes);
  const productPayload = pickBySchema(req.body, Product);

  const { value: productData, error: productError } =
    validateUpdateProductPayload(productPayload);

  if (productError) {
    res.status(UNPROCESSABLE_ENTITY.code);
    res.statusMessage = UNPROCESSABLE_ENTITY.title;
    throw productError;
  }

  if (bookId) {
    const { value: bookData, error: bookError } =
      validateUpdateBookPayload(bookPayload);

    if (bookError) {
      res.status(UNPROCESSABLE_ENTITY.code);
      res.statusMessage = UNPROCESSABLE_ENTITY.title;
      throw bookError;
    }

    categoryData = bookData;
  } else if (clothesId) {
    const { value: clothesData, error: clothesError } =
      validateUpdateClothesPayload(clothesPayload);

    if (clothesError) {
      res.status(UNPROCESSABLE_ENTITY.code);
      res.statusMessage = UNPROCESSABLE_ENTITY.title;
      throw clothesError;
    }

    categoryData = clothesData;
  }

  try {
    const data = await updateProduct(
      req.params.productId,
      productData,
      categoryData,
      bookId,
      clothesId,
    );
    await cacheInvalidate(["api:v1:product*"]);

    return successResponse(res, "Product updated successfully!", data);
  } catch (error) {
    if (error.message === "Product not found.") {
      res.status(NOT_FOUND.code);
      res.statusMessage = NOT_FOUND.title;
    } else {
      res.status(BAD_REQUEST.code);
      res.statusMessage = BAD_REQUEST.title;
    }

    throw error;
  }
});

/**
 * @description Delete an existing product and its category-specific details
 * @route DELETE /api/v1/product/:productId
 * @access private (role: ADMIN)
 */
const deleteProductController = expressAsyncHandler(async (req, res) => {
  try {
    const data = await deleteProduct(req.params.productId);
    await cacheInvalidate(["api:v1:product*"]);

    return successResponse(res, "Product deleted successfully!", data);
  } catch (error) {
    if (error.message === "Product not found.") {
      res.status(NOT_FOUND.code);
      res.statusMessage = NOT_FOUND.title;
    } else {
      res.status(BAD_REQUEST.code);
      res.statusMessage = BAD_REQUEST.title;
    }

    throw error;
  }
});

/**
 * @description Delete multiple products and their category-specific details
 * @route POST /api/v1/product/delete
 * @access private (role: ADMIN)
 */
const deleteProductsController = expressAsyncHandler(async (req, res) => {
  const { value: deleteProductsData, error } = validateDeleteProductsPayload(
    req.body,
  );

  if (error) {
    res.status(UNPROCESSABLE_ENTITY.code);
    res.statusMessage = UNPROCESSABLE_ENTITY.title;
    throw error;
  }

  try {
    const result = await deleteProducts(deleteProductsData.productIds);
    await cacheInvalidate(["api:v1:product*"]);

    return successResponse(
      res,
      "Selected products deleted successfully!",
      result,
    );
  } catch (error) {
    if (error.message === "No products found with the provided IDs.") {
      res.status(NOT_FOUND.code);
      res.statusMessage = NOT_FOUND.title;
    } else {
      res.status(BAD_REQUEST.code);
      res.statusMessage = BAD_REQUEST.title;
    }

    throw error;
  }
});

/**
 * @description Delete all products and their category-specific details
 * @route DELETE /api/v1/product
 * @access private (role: ADMIN)
 */
const deleteAllProductsController = expressAsyncHandler(async (req, res) => {
  const data = await deleteAllProducts();
  await cacheInvalidate(["api:v1:product*"]);

  return successResponse(res, `${data.deletedCount} products deleted`, data);
});

export {
  saveProductController,
  fetchAllProductsController,
  fetchProductByIdController,
  updateProductController,
  deleteProductController,
  deleteProductsController,
  deleteAllProductsController,
};
