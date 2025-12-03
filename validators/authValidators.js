import Joi from "joi";

export const validateAuthenticatePayload = (payload) => {
  const authenticateSchema = Joi.object({
    email: Joi.string().email().label("email"),
    phone: Joi.string()
      .pattern(/^[0-9]{10}$/, "valid 10 digit phone number")
      .messages({
        "string.pattern.name": "phone must be a valid 10 digit number",
      })
      .label("phone"),
  })
    .xor("email", "phone")
    .messages({
      "object.xor": "Either email or phone must be provided",
      "object.missing": "Either email or phone must be provided",
    });

  return authenticateSchema.validate(payload, { abortEarly: false });
};

export const validateVerifyOTPPayload = (payload) => {
  const otpVerificationSchema = Joi.object({
    contact: Joi.string().required().label("contact"),
    otp: Joi.string().length(6).required().label("otp"),
  });

  return otpVerificationSchema.validate(payload, { abortEarly: false });
};
