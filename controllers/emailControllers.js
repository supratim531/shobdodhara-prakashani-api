import { successResponse } from "../utils/response.js";
import expressAsyncHandler from "express-async-handler";
import { UNPROCESSABLE_ENTITY } from "../constants/statusCodes.js";
import {
  validateSendEnquiryEmailPayload,
  validateSendJoinRequestEmailPayload,
} from "../validators/emailValidators.js";
import {
  sendEnquiryEmail,
  sendJoinRequestEmail,
} from "../services/emailServices.js";

/**
 * @description Send enquiry email to contact us
 * @route POST /api/v1/email/enquiry
 * @access public
 */
const sendEnquiryEmailController = expressAsyncHandler(async (req, res) => {
  const { value: enquiryData, error } = validateSendEnquiryEmailPayload(
    req.body,
  );

  if (error) {
    res.status(UNPROCESSABLE_ENTITY.code);
    res.statusMessage = UNPROCESSABLE_ENTITY.title;
    throw error;
  }

  const { name, phone, email, enquiry } = enquiryData;
  await sendEnquiryEmail(name, phone, email, enquiry);

  return successResponse(
    res,
    "Your enquiry has been submitted successfully. We will get back to you soon!",
  );
});

/**
 * @description Send join request email with attachments to connect as an author
 * @route POST /api/v1/email/join
 * @access public
 */
const sendJoinRequestEmailController = expressAsyncHandler(async (req, res) => {
  const { value: joinRequestData, error } = validateSendJoinRequestEmailPayload(
    req.body,
  );

  if (error) {
    res.status(UNPROCESSABLE_ENTITY.code);
    res.statusMessage = UNPROCESSABLE_ENTITY.title;
    throw error;
  }

  const files = req.files || [];
  const { name, phone, email } = joinRequestData;
  await sendJoinRequestEmail(name, phone, email, files);

  return successResponse(
    res,
    "Your application has been submitted successfully. We will review and get back to you soon!",
  );
});

export { sendEnquiryEmailController, sendJoinRequestEmailController };
