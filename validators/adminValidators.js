import Joi from "joi";

export const validateLoginPayload = (payload) => {
  const loginSchema = Joi.object({
    email: Joi.string().email().label("email"),
    phone: Joi.string()
      .pattern(/^[0-9]{10}$/, "valid 10 digit phone number")
      .messages({
        "string.pattern.name": "phone must be a valid 10 digit number",
      })
      .label("phone"),
    password: Joi.string().required().label("password"),
  })
    .xor("email", "phone")
    .with("email", "password")
    .with("phone", "password")
    .messages({
      "object.xor": "Provide either email or phone, not both.",
      "object.missing": "Either email or phone must be provided.",
      "any.required": "{{#label}} is required.",
    });

  return loginSchema.validate(payload, { abortEarly: false });
};

export const validateVerificationPayload = (payload) => {
  const verificationSchema = Joi.object({
    password: Joi.string().required().label("password"),
  });

  return verificationSchema.validate(payload, { abortEarly: false });
};
