import Joi from "joi";

export const validateGenerateOrderLabelPayload = (payload) => {
  const generateOrderLabelSchema = Joi.object({
    shiprocketShipmentIds: Joi.array()
      .items(Joi.number().required())
      .min(1)
      .required()
      .label("shiprocketShipmentIds"),
  });

  return generateOrderLabelSchema.validate(payload, { abortEarly: false });
};
