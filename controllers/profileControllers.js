import { successResponse } from "../utils/response.js";
import expressAsyncHandler from "express-async-handler";
import {
  CREATED,
  NOT_FOUND,
  UNPROCESSABLE_ENTITY,
} from "../constants/statusCodes.js";
import {
  fetchCurrentProfile,
  updateProfile,
  saveAddress,
  updateAddress,
  deleteAddress,
  updateDefaultAddress,
} from "../services/profileServices.js";
import {
  validateUpdateProfilePayload,
  validateSaveAddressPayload,
  validateUpdateAddressPayload,
} from "../validators/profileValidators.js";

/**
 * @description Fetch the profile of current logged in user
 * @route GET /api/v1/profile/current
 * @access private (role: USER, ADMIN)
 */
const fetchCurrentProfileController = expressAsyncHandler(async (req, res) => {
  const user = await fetchCurrentProfile(req.user.id);

  return successResponse(res, "Current profile fetched.", user);
});

/**
 * @description Update the profile of current logged in user
 * @route PATCH /api/v1/profile/current
 * @access private (role: USER, ADMIN)
 */
const updateProfileController = expressAsyncHandler(async (req, res) => {
  const { value: updatedUserData, error } = validateUpdateProfilePayload(
    req.body
  );

  if (error) {
    res.status(UNPROCESSABLE_ENTITY.code);
    res.statusMessage = UNPROCESSABLE_ENTITY.title;
    throw error;
  }

  const updatedUser = await updateProfile(req.user.id, updatedUserData);

  return successResponse(res, "Account details updated!", updatedUser);
});

/**
 * @description Save a new address for current logged in user
 * @route POST /api/v1/profile/address
 * @access private (role: USER)
 */
const saveAddressController = expressAsyncHandler(async (req, res) => {
  const { value: addressData, error } = validateSaveAddressPayload(req.body);

  if (error) {
    res.status(UNPROCESSABLE_ENTITY.code);
    res.statusMessage = UNPROCESSABLE_ENTITY.title;
    throw error;
  }

  const address = await saveAddress(req.user.id, addressData);

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
 * @access private (role: USER)
 */
const updateAddressController = expressAsyncHandler(async (req, res) => {
  const { value: updatedAddressData, error } = validateUpdateAddressPayload(
    req.body
  );

  if (error) {
    res.status(UNPROCESSABLE_ENTITY.code);
    res.statusMessage = UNPROCESSABLE_ENTITY.title;
    throw error;
  }

  const updatedAddress = await updateAddress(
    req.user.id,
    req.params.addressId,
    updatedAddressData
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
 * @access private (role: USER)
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
 * @access private (role: USER)
 */
const updateDefaultAddressController = expressAsyncHandler(async (req, res) => {
  const updatedAddress = await updateDefaultAddress(
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
  fetchCurrentProfileController,
  updateProfileController,
  saveAddressController,
  updateAddressController,
  deleteAddressController,
  updateDefaultAddressController,
};
