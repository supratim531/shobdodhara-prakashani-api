import { successResponse } from "../utils/response.js";
import expressAsyncHandler from "express-async-handler";
import {
  CREATED,
  NOT_FOUND,
  UNPROCESSABLE_ENTITY,
} from "../constants/statusCodes.js";
import {
  currentProfile,
  updateProfile,
  saveAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from "../services/profileServices.js";
import {
  validateUpdateProfilePayload,
  validateSaveAddressPayload,
  validateUpdateAddressPayload,
} from "../validators/profileValidators.js";

/**
 * @description Fetch the profile of current logged in user
 * @route GET /api/v1/profile/current
 * @access private
 */
const currentProfileController = expressAsyncHandler(async (req, res) => {
  const user = await currentProfile(req.user.id);

  return successResponse(res, "Current profile fetched.", user);
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

/**
 * @description Save a new address for current logged in user
 * @route POST /api/v1/profile/address
 * @access private
 */
const saveAddressController = expressAsyncHandler(async (req, res) => {
  const { value, error } = validateSaveAddressPayload(req.body);

  if (error) {
    res.status(UNPROCESSABLE_ENTITY.code);
    res.statusMessage = UNPROCESSABLE_ENTITY.title;
    throw error;
  }

  const address = await saveAddress(req.user.id, value);

  return successResponse(
    res,
    "Address saved successfully!",
    address,
    CREATED.code
  );
});

/**
 * @description Update an existing address for current logged in user
 * @route PATCH /api/v1/profile/address/:addressId
 * @access private
 */
const updateAddressController = expressAsyncHandler(async (req, res) => {
  const { value, error } = validateUpdateAddressPayload(req.body);

  if (error) {
    res.status(UNPROCESSABLE_ENTITY.code);
    res.statusMessage = UNPROCESSABLE_ENTITY.title;
    throw error;
  }

  const updatedAddress = await updateAddress(
    req.user.id,
    req.params.addressId,
    value
  );

  if (!updatedAddress) {
    res.status(NOT_FOUND.code);
    res.statusMessage = NOT_FOUND.title;
    throw new Error("Address not found");
  }

  return successResponse(res, "Address updated successfully!", updatedAddress);
});

/**
 * @description Delete an address for current logged in user
 * @route DELETE /api/v1/profile/address/:addressId
 * @access private
 */
const deleteAddressController = expressAsyncHandler(async (req, res) => {
  const deletedAddress = await deleteAddress(req.user.id, req.params.addressId);

  if (!deletedAddress) {
    res.status(NOT_FOUND.code);
    res.statusMessage = NOT_FOUND.title;
    throw new Error("Address not found");
  }

  return successResponse(res, "Address deleted successfully!", deletedAddress);
});

/**
 * @description Set an address as default for current logged in user
 * @route PATCH /api/v1/profile/address/:addressId/default
 * @access private
 */
const setDefaultAddressController = expressAsyncHandler(async (req, res) => {
  const updatedAddress = await setDefaultAddress(
    req.user.id,
    req.params.addressId
  );

  if (!updatedAddress) {
    res.status(NOT_FOUND.code);
    res.statusMessage = NOT_FOUND.title;
    throw new Error("Address not found");
  }

  return successResponse(
    res,
    "Default address updated successfully!",
    updatedAddress
  );
});

export {
  currentProfileController,
  updateProfileController,
  saveAddressController,
  updateAddressController,
  deleteAddressController,
  setDefaultAddressController,
};
