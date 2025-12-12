import Joi from "joi";

export const validatePrepareCheckoutPayload = (payload) => {
  const checkoutRefreshSchema = Joi.object({
    addressId: Joi.string().required().label("addressId"),
  });

  return checkoutRefreshSchema.validate(payload, { abortEarly: false });
};
