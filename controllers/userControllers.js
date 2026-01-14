import { successResponse } from "../utils/response.js";
import expressAsyncHandler from "express-async-handler";
import {
  fetchAllUsers,
  deleteUser,
  deactivateUser,
} from "../services/userServices.js";

/**
 * @description Get all users with pagination
 * @route GET /api/v1/user
 * @access private (role: ADMIN)
 */
const fetchAllUsersController = expressAsyncHandler(async (req, res) => {
  const { items, meta } = await fetchAllUsers(req.query);

  return successResponse(res, "All users fetched.", { items, meta });
});

/**
 * @description Delete an user by its id
 * @route DELETE /api/v1/user/:userId
 * @access private (role: ADMIN)
 */
const deleteUserController = expressAsyncHandler(async (req, res) => {
  const data = await deleteUser(req.params.userId);

  return successResponse(res, "User deleted!", data);
});

/**
 * @description Deactivate an user by its id
 * @route DELETE /api/v1/user/deactivate/:userId
 * @access private (role: ADMIN)
 */
const deactivateUserController = expressAsyncHandler(async (req, res) => {
  const data = await deactivateUser(req.params.userId);

  return successResponse(res, "User deactivated!", data);
});

export {
  fetchAllUsersController,
  deleteUserController,
  deactivateUserController,
};
