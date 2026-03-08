import Joi from "joi";

export const validateSendEnquiryEmailPayload = (payload) => {
  const sendEnquiryEmailSchema = Joi.object({
    name: Joi.string().trim().required().label("name"),
    phone: Joi.string()
      .trim()
      .pattern(/^[0-9]{10}$/, "valid 10 digit phone number")
      .required()
      .messages({
        "string.pattern.name": "phone must be a valid 10 digit number",
      })
      .label("phone"),
    email: Joi.string().trim().email().required().label("email"),
    enquiry: Joi.string().trim().required().label("enquiry"),
  });

  return sendEnquiryEmailSchema.validate(payload, { abortEarly: false });
};

export const validateSendJoinRequestEmailPayload = (payload) => {
  const sendJoinRequestEmailSchema = Joi.object({
    name: Joi.string().trim().required().label("name"),
    phone: Joi.string()
      .trim()
      .pattern(/^[0-9]{10}$/, "valid 10 digit phone number")
      .required()
      .messages({
        "string.pattern.name": "phone must be a valid 10 digit number",
      })
      .label("phone"),
    email: Joi.string().trim().email().required().label("email"),
  });

  return sendJoinRequestEmailSchema.validate(payload, { abortEarly: false });
};
