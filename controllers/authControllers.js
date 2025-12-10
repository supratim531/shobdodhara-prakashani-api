import emailQueue from "../queues/emailQueue.js";
import { successResponse } from "../utils/response.js";
import expressAsyncHandler from "express-async-handler";
import { SEND_OTP_EMAIL_JOB } from "../constants/jobs.js";
import { authenticate, verifyOTP } from "../services/authServices.js";
import { BAD_REQUEST, UNPROCESSABLE_ENTITY } from "../constants/statusCodes.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateToken.js";
import {
  validateAuthenticatePayload,
  validateVerifyOTPPayload,
} from "../validators/authValidators.js";

/**
 * @description OTP based user authentication with either email or phone
 * @route POST /api/v1/auth/authenticate
 * @access public
 */
const authenticateController = expressAsyncHandler(async (req, res) => {
  const { value: authenticationData, error } = validateAuthenticatePayload(
    req.body
  );

  if (error) {
    res.status(UNPROCESSABLE_ENTITY.code);
    res.statusMessage = UNPROCESSABLE_ENTITY.title;
    throw error;
  }

  const { email, phone } = authenticationData;
  const { contact, otp } = await authenticate(email, phone);

  if (email) {
    const mail = {
      email,
      subject: "Verify your Shobdodhara Prakashani account login",
      body: `
        <h1 style="text-align: center;">Please verify your</h1>
        <h1 style="text-align: center;">email Address</h1>
        <p style="text-align: center;">Please use the verification code below to verify that</p>
        <p style="text-align: center;">the email address belongs to you.</p>
        <h2 style="text-align: center;">${otp}</h2><br/>
        <p style="text-align: center;">It's good to have you.</p>
      `,
    };
    await emailQueue.add(SEND_OTP_EMAIL_JOB, mail);
  } else {
    console.log("await sendSMS(phone, `Your OTP is ${otp}`)");
  }

  return successResponse(res, `OTP sent successfully at ${email || phone}.`, {
    contact,
    otp,
  });
});

/**
 * @description Verify OTP and onboard the user
 * @route POST /api/v1/auth/verify-otp
 * @access public
 */
const verifyOTPController = expressAsyncHandler(async (req, res) => {
  const { value: verificationData, error } = validateVerifyOTPPayload(req.body);

  if (error) {
    res.status(UNPROCESSABLE_ENTITY.code);
    res.statusMessage = UNPROCESSABLE_ENTITY.title;
    throw error;
  }

  const { contact, otp } = verificationData;
  const user = await verifyOTP(contact, otp);

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

  return successResponse(res, "Login and verification successful!");
});

/**
 * @description Perform clear cookies in order to logout user
 * @route POST /api/v1/auth/logout
 * @access public
 */
const logoutController = expressAsyncHandler(async (req, res) => {
  res.clearCookie("access-token");
  res.clearCookie("refresh-token");

  return successResponse(res, "User logged out successfully.");
});

export { authenticateController, verifyOTPController, logoutController };
