import { successResponse } from "../utils/response.js";
import expressAsyncHandler from "express-async-handler";
import { uploadProductImages } from "../services/uploadServices.js";
import {
  CREATED,
  BAD_REQUEST,
  UNPROCESSABLE_ENTITY,
} from "../constants/statusCodes.js";

/**
 * @description Upload product image along with specific category
 * @route POST /api/v1/upload/product/:category
 * @param {string} category - The category of the product
 * @access private (role: ADMIN)
 */
const uploadProductImagesController = expressAsyncHandler(async (req, res) => {
  try {
    const files = req.files;
    const category = req.params.category.toLowerCase();

    if (!files || files.length === 0) {
      res.status(UNPROCESSABLE_ENTITY.code);
      res.statusMessage = UNPROCESSABLE_ENTITY.title;
      throw new Error("No files provided.");
    }

    const data = await uploadProductImages(files, category);

    return successResponse(
      res,
      `${files.length} image(s) uploaded successfully.`,
      data,
      CREATED.code
    );
  } catch (error) {
    res.status(BAD_REQUEST.code);
    res.statusMessage = BAD_REQUEST.title;
    throw error;
  }
});

export { uploadProductImagesController };
