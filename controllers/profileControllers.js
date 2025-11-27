import { successResponse } from "../utils/response.js";
import expressAsyncHandler from "express-async-handler";
import { UNPROCESSABLE_ENTITY } from "../constants/statusCodes.js";
import { currentProfile, updateProfile } from "../services/profileServices.js";
import { validateUpdateProfilePayload } from "../validators/profileValidators.js";

/**
 * @description Fetch the profile of current logged in user
 * @route GET /api/v1/profile/current
 * @access private
 */
const currentProfileController = expressAsyncHandler(async (req, res) => {
  const user = await currentProfile(req.user.id);

  return successResponse(res, "Current profile fetched", user);
});

/**
 * @description Update the profile of current logged in user
 * @route PATCH /api/v1/profile/current
 * @access private
 */
const updateProfileController = expressAsyncHandler(async (req, res) => {
  const { value, error } = validateUpdateProfilePayload(req.body);

  if (error) {
    res.status(UNPROCESSABLE_ENTITY.code);
    res.statusMessage = UNPROCESSABLE_ENTITY.title;
    throw error;
  }

  const updatedUser = await updateProfile(req.user.id, value);

  return successResponse(res, "Account details updated!", updatedUser);
});

export { currentProfileController, updateProfileController };
