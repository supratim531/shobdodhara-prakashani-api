import { createOrderAfterPayment } from "./orderServices.js";
import { createShiprocketOrder, assignCourier } from "./shiprocketServices.js";

const processPaymentSuccess = async (userId, paymentId, shippingAddress) => {
  // Create order after successful payment
  const order = await createOrderAfterPayment(
    userId,
    paymentId,
    shippingAddress
  );

  // Create Shiprocket order
  const shiprocketOder = await createShiprocketOrder(order._id);

  // Assign courier for the order
  await assignCourier(order._id, shiprocketOder.shipment_id);

  return order;
};

export { processPaymentSuccess };
