import Joi from "joi";

export const validateSaveCouponPayload = (payload) => {
  const saveCouponSchema = Joi.object({
    code: Joi.string().required().uppercase().trim().label("code"),
    description: Joi.string().trim().label("description"),
    discountType: Joi.string()
      .valid("FLAT", "PERCENTAGE")
      .required()
      .label("discountType"),
    discountValue: Joi.number().min(0).required().label("discountValue"),
    maxDiscount: Joi.number().min(0).label("maxDiscount"),
    minOrderValue: Joi.number().min(0).default(0).label("minOrderValue"),
    usageLimit: Joi.number().min(0).default(0).label("usageLimit"),
    perUserUsageLimit: Joi.number()
      .min(1)
      .default(1)
      .label("perUserUsageLimit"),
    startDate: Joi.date().required().label("startDate"),
    endDate: Joi.date()
      .greater(Joi.ref("startDate"))
      .required()
      .label("endDate"),
    isActive: Joi.boolean().default(true).label("isActive"),
  });

  return saveCouponSchema.validate(payload, { abortEarly: false });
};

export const validateUpdateCouponPayload = (payload) => {
  const updateCouponSchema = Joi.object({
    description: Joi.string().trim().label("description"),
    discountType: Joi.string()
      .valid("FLAT", "PERCENTAGE")
      .label("discountType"),
    discountValue: Joi.number().min(0).label("discountValue"),
    maxDiscount: Joi.number().min(0).label("maxDiscount"),
    minOrderValue: Joi.number().min(0).label("minOrderValue"),
    usageLimit: Joi.number().min(0).label("usageLimit"),
    perUserUsageLimit: Joi.number().min(1).label("perUserUsageLimit"),
    startDate: Joi.date().label("startDate"),
    endDate: Joi.date()
      .when("startDate", {
        is: Joi.exist(),
        then: Joi.date().greater(Joi.ref("startDate")),
        otherwise: Joi.date(),
      })
      .label("endDate"),
    isActive: Joi.boolean().label("isActive"),
  });

  return updateCouponSchema.validate(payload, { abortEarly: false });
};
