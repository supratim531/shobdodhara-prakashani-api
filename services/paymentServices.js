import { createOrderAfterPayment } from "./orderServices.js";

const processPaymentSuccess = async (userId, paymentId, shippingAddress) => {
  // Create order after successful payment
  const order = await createOrderAfterPayment(
    userId,
    paymentId,
    shippingAddress
  );

  // TODO: Trigger Shiprocket integration

  return order;
};

export { processPaymentSuccess };
