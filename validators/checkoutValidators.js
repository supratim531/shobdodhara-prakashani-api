import Joi from "joi";

export const validatePrepareCheckoutPayload = (payload) => {
  const checkoutRefreshSchema = Joi.object({
    addressId: Joi.string().required().label("addressId"),
    shippingCost: Joi.number().min(0).required().label("shippingCost"),
  });

  return checkoutRefreshSchema.validate(payload, { abortEarly: false });
};

export const validateCheckoutAddressPayload = (payload) => {
  const checkoutAddressSchema = Joi.object({
    deliveryPostcode: Joi.string().required().label("deliveryPostcode"),
    maxLength: Joi.number().min(0.6).required().label("maxLength"),
    maxBreadth: Joi.number().min(0.6).required().label("maxBreadth"),
    totalHeight: Joi.number().min(0.6).required().label("totalHeight"),
    totalWeight: Joi.number().min(0.1).required().label("totalWeight"),
    cod: Joi.number().valid(0, 1).required().label("cod"),
  });

  return checkoutAddressSchema.validate(payload, { abortEarly: false });
};
