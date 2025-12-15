import { createOrderAfterPayment } from "./orderServices.js";
import { createShiprocketOrder } from "./shiprocketServices.js";

const processPaymentSuccess = async (userId, paymentId, shippingAddress) => {
  // Create order after successful payment
  const order = await createOrderAfterPayment(
    userId,
    paymentId,
    shippingAddress
  );

  // Create Shiprocket order
  await createShiprocketOrder(order._id);

  return order;
};

export { processPaymentSuccess };
