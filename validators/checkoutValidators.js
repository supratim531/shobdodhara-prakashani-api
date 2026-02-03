import Joi from "joi";

export const validatePrepareCheckoutPayload = (payload) => {
  const checkoutRefreshSchema = Joi.object({
    addressId: Joi.string().required().label("addressId"),
  });

  return checkoutRefreshSchema.validate(payload, { abortEarly: false });
};

export const validateCheckoutAddressPayload = (payload) => {
  const checkoutAddressSchema = Joi.object({
    pickupCode: Joi.string().required().label("pickupCode"),
    deliveryCode: Joi.string().required().label("deliveryCode"),
    weight: Joi.number().min(0.1).required().label("weight"),
    cod: Joi.number().valid(0, 1).default(0).label("cod"),
  });

  return checkoutAddressSchema.validate(payload, { abortEarly: false });
};
