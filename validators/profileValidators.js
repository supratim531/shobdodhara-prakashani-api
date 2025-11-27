import Joi from "joi";

export const validateUpdateProfilePayload = (payload) => {
  const updateProfileSchema = Joi.object({
    firstName: Joi.string().min(2).label("firstName"),
    lastName: Joi.string().min(2).label("lastName"),
    gender: Joi.string().valid("MALE", "FEMALE", "OTHER").label("gender"),
  });

  return updateProfileSchema.validate(payload, { abortEarly: false });
};
