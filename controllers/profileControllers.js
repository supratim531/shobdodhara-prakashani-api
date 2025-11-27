import Address from "../models/addressModel.js";
import { successResponse } from "../utils/response.js";
import expressAsyncHandler from "express-async-handler";

/**
 * @description Fetch the current profile of logged in user
 * @route GET /api/v1/profile/current
 * @access private
 */
const currentProfileController = expressAsyncHandler(async (req, res) => {
  const user = req.user;
  user.addresses = await Address.find({ userId: req.user.id })
    .select("-_id -user_id -createdAt -updatedAt -__v")
    .lean();

  return successResponse(res, "Current profile fetched", user);
});

export { currentProfileController };
