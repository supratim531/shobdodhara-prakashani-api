import { successResponse } from "../utils/response.js";
import expressAsyncHandler from "express-async-handler";

/**
 * @description Fetch the current profile of logged in user
 * @route GET /api/v1/profile/current
 * @access private
 */
const currentProfileController = expressAsyncHandler(async (req, res) => {
  return successResponse(res, "Current profile fetched", req.user);
});

export { currentProfileController };
