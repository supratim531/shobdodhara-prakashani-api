import Joi from "joi";

export const validateVerifyPaymentPayload = (payload) => {
  const verifyPaymentSchema = Joi.object({
    totalAmount: Joi.number().min(1).required().label("totalAmount"),
    razorpay_order_id: Joi.string().required().label("razorpay_order_id"),
    razorpay_payment_id: Joi.string().required().label("razorpay_payment_id"),
    razorpay_signature: Joi.string().required().label("razorpay_signature"),
    shippingAddress: Joi.object().required().label("shippingAddress"),
    courierId: Joi.number().min(1).required().label("courierId"),
  });

  return verifyPaymentSchema.validate(payload, { abortEarly: false });
};
