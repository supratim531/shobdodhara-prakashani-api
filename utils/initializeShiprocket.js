import { getValidToken } from "../services/shiprocketServices.js";

const initializeShiprocket = async () => {
  try {
    const authToken = await getValidToken();
    console.log("Shiprocket authentication initialized:", authToken);
  } catch (error) {
    console.error("Shiprocket initialization failed:", error.message);
  }
};

export default initializeShiprocket;
