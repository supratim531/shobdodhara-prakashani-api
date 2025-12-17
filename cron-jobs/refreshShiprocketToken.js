import { getValidToken } from "../services/shiprocketServices.js";

const refreshShiprocketToken = async () => {
  try {
    const authToken = await getValidToken();
    console.log("----- Shiprocket token refreshed -----", authToken);
  } catch (error) {
    console.error("----- Shiprocket token refresh failed -----", error.message);
  }
};

export default refreshShiprocketToken;
