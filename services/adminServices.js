import bcrypt from "bcrypt";
import User from "../models/userModel.js";
import { saveOTP } from "./otpServices.js";

const login = async (email, phone, password) => {
  const contact = email ? `email:${email}` : `phone:${phone}`;
  const user = await User.findOne(
    email ? { email, role: "ADMIN" } : { phone, role: "ADMIN" }
  ).select("+password");

  if (user !== null && (await bcrypt.compare(password, user.password))) {
    const otp = await saveOTP(contact);
    return { contact, otp };
  }

  throw new Error("Invalid credentials");
};

export { login };
