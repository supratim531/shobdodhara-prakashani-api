import User from "../models/userModel.js";
import { saveOTP, findOTP } from "./otpServices.js";

const authenticate = async (email, phone) => {
  const contact = email ? `email:${email}` : `phone:${phone}`;
  const user = await User.findOne(email ? { email } : { phone });

  if (!user) {
    const verifyExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
    await User.create({
      email: email ?? null,
      phone: phone ?? null,
      isOnboarded: false,
      verifyExpiresAt,
    });
  }

  const otp = await saveOTP(contact);

  return { contact, otp };
};

const verifyOTP = async (contact, otp) => {
  const record = await findOTP(contact, otp);

  if (!record) return null;

  const [key, value] = contact.split(":");
  let user = await User.findOne({ [key]: value });

  if (!user.isOnboarded) {
    user = await User.findOneAndUpdate(
      { [key]: value },
      {
        $set: { isOnboarded: true },
        $unset: { verifyExpiresAt: "" },
      },
      { new: true }
    );
  }

  return user;
};

export { authenticate, verifyOTP };
