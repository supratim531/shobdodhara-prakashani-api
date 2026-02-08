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
    weight: Joi.number().min(0.1).required().label("weight"),
    cod: Joi.number().valid(0, 1).default(0).label("cod"),
  });

  return checkoutAddressSchema.validate(payload, { abortEarly: false });
};
