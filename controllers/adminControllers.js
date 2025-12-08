import emailQueue from "../queues/emailQueue.js";
import { login } from "../services/adminServices.js";
import { successResponse } from "../utils/response.js";
import expressAsyncHandler from "express-async-handler";
import { SEND_OTP_EMAIL_JOB } from "../constants/jobs.js";
import { validateLoginPayload } from "../validators/adminValidators.js";
import { BAD_REQUEST, UNPROCESSABLE_ENTITY } from "../constants/statusCodes.js";

/**
 * @description Login for admin only
 * @route POST /api/v1/admin/login
 * @access public
 */
const loginController = expressAsyncHandler(async (req, res) => {
  const { value: loginData, error } = validateLoginPayload(req.body);

  if (error) {
    res.status(UNPROCESSABLE_ENTITY.code);
    res.statusMessage = UNPROCESSABLE_ENTITY.title;
    throw error;
  }

  const { email, phone, password } = loginData;

  try {
    const { contact, otp } = await login(email, phone, password);

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
  } catch (error) {
    res.status(BAD_REQUEST.code);
    res.statusMessage = BAD_REQUEST.title;
    throw error;
  }
});

export { loginController };
