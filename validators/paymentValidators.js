import Joi from "joi";

export const validateCreateOrderPayload = (payload) => {
  const createOrderSchema = Joi.object({
    addressId: Joi.string().required().label("addressId"),
  });

  return createOrderSchema.validate(payload, { abortEarly: false });
};

export const validateVerifyPaymentPayload = (payload) => {
  const verifyPaymentSchema = Joi.object({
    razorpay_order_id: Joi.string().required().label("razorpay_order_id"),
    razorpay_payment_id: Joi.string().required().label("razorpay_payment_id"),
    razorpay_signature: Joi.string().required().label("razorpay_signature"),
    shippingAddress: Joi.object().required().label("shippingAddress"),
  });

  return verifyPaymentSchema.validate(payload, { abortEarly: false });
};

export const validateHandleWebhookPayload = (payload) => {
  const handleWebhookSchema = Joi.object({
    event: Joi.string().required().label("event"),
    payload: Joi.object().required().label("payload"),
  });

  return handleWebhookSchema.validate(payload, { abortEarly: false });
};
