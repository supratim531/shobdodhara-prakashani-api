import axios from "axios";

let authToken = null;
let tokenExpiry = null;
const SHIPROCKET_BASE_URL = "https://apiv2.shiprocket.in/v1";

const shiprocketLogin = async () => {
  try {
    const response = await axios.post(
      `${SHIPROCKET_BASE_URL}/external/auth/login`,
      {
        email: process.env.SHIPROCKET_API_USER_EMAIL,
        password: process.env.SHIPROCKET_API_USER_PASS,
      }
    );

    authToken = response.data.token;
    tokenExpiry = Date.now() + 24 * 60 * 60 * 1000; // 24 hours from now

    return authToken;
  } catch (error) {
    throw new Error(
      `Shiprocket login failed: ${
        error.response?.data?.message || error.message
      }`
    );
  }
};

const getValidToken = async () => {
  if (!authToken || Date.now() >= tokenExpiry) {
    await shiprocketLogin();
  }

  return authToken;
};

export { shiprocketLogin, getValidToken };
