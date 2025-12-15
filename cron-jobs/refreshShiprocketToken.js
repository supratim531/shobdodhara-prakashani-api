import { shiprocketLogin } from "../services/shiprocketServices.js";

const refreshShiprocketToken = async () => {
  try {
    await shiprocketLogin();
    console.log("----- Shiprocket token refreshed successfully -----");
  } catch (error) {
    console.error("----- Shiprocket token refresh failed -----", error.message);
  }
};

export default refreshShiprocketToken;
