import Joi from "joi";

export const validateUpdateProfilePayload = (payload) => {
  const updateProfileSchema = Joi.object({
    firstName: Joi.string().min(2).label("firstName"),
    lastName: Joi.string().min(2).label("lastName"),
    gender: Joi.string().valid("MALE", "FEMALE", "OTHER").label("gender"),
  });

  return updateProfileSchema.validate(payload, { abortEarly: false });
};

export const validateSaveAddressPayload = (payload) => {
  const saveAddressSchema = Joi.object({
    recipientName: Joi.string()
      .min(2)
      .max(100)
      .required()
      .label("recipientName"),
    phone: Joi.string()
      .pattern(/^[0-9]{10}$/, "valid 10 digit phone number")
      .messages({
        "string.pattern.name": "phone must be a valid 10 digit number",
      })
      .label("phone"),
    alternatePhone: Joi.string()
      .pattern(/^[0-9]{10}$/, "valid 10 digit phone number")
      .optional()
      .messages({
        "string.pattern.name": "alternatePhone must be a valid 10 digit number",
      })
      .label("alternatePhone"),
    addressDetails: Joi.string().max(255).required().label("addressDetails"),
    landmark: Joi.string().max(150).label("landmark"),
    state: Joi.string().max(100).required().label("state"),
    city: Joi.string().max(100).required().label("city"),
    zipCode: Joi.string()
      .pattern(/^[1-9][0-9]{5}$/, "valid 6 digit zip code")
      .required()
      .messages({
        "string.pattern.name":
          "zipCode must be a valid 6 digit zip code (cannot start with 0)",
      })
      .label("zipCode"),
    addressType: Joi.string()
      .valid("HOME", "WORK", "OTHER")
      .default("HOME")
      .label("addressType"),
    isDefault: Joi.boolean().default(false).label("isDefault"),
  });

  return saveAddressSchema.validate(payload, { abortEarly: false });
};

export const validateUpdateAddressPayload = (payload) => {
  const updateAddressSchema = Joi.object({
    recipientName: Joi.string().min(2).max(100).label("recipientName"),
    phone: Joi.string()
      .pattern(/^[0-9]{10}$/, "valid 10 digit phone number")
      .messages({
        "string.pattern.name": "phone must be a valid 10 digit number",
      })
      .label("phone"),
    alternatePhone: Joi.string()
      .pattern(/^[0-9]{10}$/, "valid 10 digit phone number")
      .optional()
      .messages({
        "string.pattern.name": "alternatePhone must be a valid 10 digit number",
      })
      .label("alternatePhone"),
    addressDetails: Joi.string().max(255).label("addressDetails"),
    landmark: Joi.string().max(150).label("landmark"),
    state: Joi.string().max(100).label("state"),
    city: Joi.string().max(100).label("city"),
    zipCode: Joi.string()
      .pattern(/^[1-9][0-9]{5}$/, "valid 6 digit zip code")
      .messages({
        "string.pattern.name":
          "zipCode must be a valid 6 digit zip code (cannot start with 0)",
      })
      .label("zipCode"),
    addressType: Joi.string()
      .valid("HOME", "WORK", "OTHER")
      .label("addressType"),
    isDefault: Joi.boolean().label("isDefault"),
  });

  return updateAddressSchema.validate(payload, { abortEarly: false });
};
