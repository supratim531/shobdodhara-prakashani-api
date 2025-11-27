import User from "../models/userModel.js";
import { saveOTP, fetchOTP } from "./otpServices.js";

const authenticate = async (email, phone) => {
  const contact = email ? `email:${email}` : `phone:${phone}`;
  const user = await User.findOne(email ? { email } : { phone });

  if (!user) {
    const verifyExpiresAt = new Date(Date.now() + (2 * 60 + 30) * 1000); // 2 minutes 30 seconds
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
  const record = await fetchOTP(contact, otp);

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
