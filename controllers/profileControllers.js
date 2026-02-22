import emailQueue from "../queues/emailQueue.js";
import messageQueue from "../queues/messageQueue.js";
import { successResponse } from "../utils/response.js";
import expressAsyncHandler from "express-async-handler";
import { SEND_OTP_JOB } from "../constants/jobs.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateToken.js";
import {
  CREATED,
  BAD_REQUEST,
  NOT_FOUND,
  UNPROCESSABLE_ENTITY,
} from "../constants/statusCodes.js";
import {
  fetchCurrentProfile,
  updateProfile,
  initiateChangeContact,
  verifyChangeContact,
  saveAddress,
  updateAddress,
  deleteAddress,
  updateDefaultAddress,
} from "../services/profileServices.js";
import {
  validateUpdateProfilePayload,
  validateInitiateChangeContactPayload,
  validateVerifyChangeContactPayload,
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
    req.body,
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
 * @description Initiate contact (email or phone) change process
 * @route POST /api/v1/profile/current/change-contact/initiate
 * @access private (role: USER, ADMIN)
 */
const initiateChangeContactController = expressAsyncHandler(
  async (req, res) => {
    const { value: initiateChangeContactData, error } =
      validateInitiateChangeContactPayload(req.body);

    if (error) {
      res.status(UNPROCESSABLE_ENTITY.code);
      res.statusMessage = UNPROCESSABLE_ENTITY.title;
      throw error;
    }

    const { email, phone } = initiateChangeContactData;
    const { contact, otp } = await initiateChangeContact(
      req.user.id,
      email,
      phone,
    );

    if (email) {
      const mail = {
        email,
        subject: "Verify your new email address for Shobdodhara Prakashani",
        body: `
          <h1 style="text-align: center;">Confirm your new email address</h1>
          <p style="text-align: center;">
            You requested to update the email address linked to your
            <strong>Shobdodhara Prakashani</strong> account.
          </p>
          <p style="text-align: center;">
            Please use the verification code below to confirm your new email address.
          </p>
          <h2 style="text-align: center;">${otp}</h2><br/>
          <p style="text-align: center;">
            If you did not request this change, please ignore this email.
          </p>
          <p style="text-align: center;">Thank you.</p>
        `,
      };

      await emailQueue.add(SEND_OTP_JOB, mail);
    } else {
      const sms = {
        phone,
        body: `Your Shobdodhara verification code: ${otp}`,
      };

      await messageQueue.add(SEND_OTP_JOB, sms);
    }

    return successResponse(res, `OTP sent successfully at ${email || phone}.`, {
      contact,
      otp,
    });
  },
);

/**
 * @description Verify contact (email or phone) change process
 * @route POST /api/v1/profile/current/change-contact/verify
 * @access private (role: USER, ADMIN)
 */
const verifyChangeContactController = expressAsyncHandler(async (req, res) => {
  const { value: verifyChangeContactData, error } =
    validateVerifyChangeContactPayload(req.body);

  if (error) {
    res.status(UNPROCESSABLE_ENTITY.code);
    res.statusMessage = UNPROCESSABLE_ENTITY.title;
    throw error;
  }

  const { contact, otp } = verifyChangeContactData;
  const user = await verifyChangeContact(req.user.id, contact, otp);

  if (!user) {
    res.status(BAD_REQUEST.code);
    res.statusMessage = BAD_REQUEST.title;
    throw new Error("Invalid OTP! Please try again.");
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  const environment = process.env.NODE_ENV || "development";

  res.cookie("access-token", accessToken, {
    httpOnly: true,
    secure: environment === "production" ? true : false,
    sameSite: environment === "production" ? "none" : "lax",
  });
  res.cookie("refresh-token", refreshToken, {
    httpOnly: true,
    secure: environment === "production" ? true : false,
    sameSite: environment === "production" ? "none" : "lax",
  });

  return successResponse(res, `Contact updated successfully.`);
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
    CREATED.code,
  );
});

/**
 * @description Update an existing address for current logged in user
 * @route PATCH /api/v1/profile/address/:addressId
 * @access private (role: USER)
 */
const updateAddressController = expressAsyncHandler(async (req, res) => {
  const { value: updatedAddressData, error } = validateUpdateAddressPayload(
    req.body,
  );

  if (error) {
    res.status(UNPROCESSABLE_ENTITY.code);
    res.statusMessage = UNPROCESSABLE_ENTITY.title;
    throw error;
  }

  const updatedAddress = await updateAddress(
    req.user.id,
    req.params.addressId,
    updatedAddressData,
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
    req.params.addressId,
  );

  if (!updatedAddress) {
    res.status(NOT_FOUND.code);
    res.statusMessage = NOT_FOUND.title;
    throw new Error("Address not found");
  }

  return successResponse(
    res,
    "Default address updated successfully!",
    updatedAddress,
  );
});

export {
  fetchCurrentProfileController,
  updateProfileController,
  initiateChangeContactController,
  verifyChangeContactController,
  saveAddressController,
  updateAddressController,
  deleteAddressController,
  updateDefaultAddressController,
};
