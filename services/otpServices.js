import OTP from "../models/otpModel.js";
import generateOTP from "../utils/generateOTP.js";

const saveOTP = async (contact) => {
  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes
  await OTP.deleteMany({ contact });
  await OTP.create({
    contact,
    otp,
    expiresAt,
  });

  return otp;
};

const fetchOTP = async (contact, otp) => {
  const record = await OTP.findOne({
    contact,
    otp,
    isUsed: false,
    expiresAt: { $gt: new Date() },
  });

  if (!record) return null;

  record.isUsed = true;
  await record.save();

  return record;
};

export { saveOTP, fetchOTP };
