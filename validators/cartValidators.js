import Joi from "joi";

export const validateSaveCartItemPayload = (payload) => {
  const saveCartItemSchema = Joi.object({
    productId: Joi.string().required().label("productId"),
    quantity: Joi.number().integer().min(1).required().label("quantity"),
  });

  return saveCartItemSchema.validate(payload, { abortEarly: false });
};

export const validateUpdateCartItemQuantityPayload = (payload) => {
  const updateCartItemQuantitySchema = Joi.object({
    quantity: Joi.number().integer().min(1).required().label("quantity"),
  });

  return updateCartItemQuantitySchema.validate(payload, { abortEarly: false });
};
