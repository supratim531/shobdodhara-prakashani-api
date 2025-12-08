import bcrypt from "bcrypt";
import dotenv from "dotenv";
import User from "../models/userModel.js";

dotenv.config({ path: "./.env", quiet: true });

const createAdmin = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPhone = process.env.ADMIN_PHONE;
    const adminPassword = process.env.ADMIN_PASS;
    let admin = await User.findOne({ email: adminEmail });

    if (!admin) {
      const salt = await bcrypt.genSalt(+process.env.SALT);
      const hashedPassword = await bcrypt.hash(adminPassword, salt);

      admin = await User.create({
        firstName: "Young",
        lastName: "Architects",
        gender: "MALE",
        email: adminEmail,
        phone: adminPhone,
        password: hashedPassword,
        role: "ADMIN",
        isOnboarded: true,
      });

      console.log("Admin created successfully:", admin);
    } else {
      console.log("Admin already exists:", admin);
    }
  } catch (error) {
    console.log("Admin creation error:", error);
    process.exit(1);
  }
};

export default createAdmin;
