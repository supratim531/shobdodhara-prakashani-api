import Joi from "joi";

export const validateSaveProductPayload = (payload) => {
  const saveProductSchema = Joi.object({
    category: Joi.string()
      .valid("BOOK", "CLOTHES")
      .required()
      .label("category"),
    title: Joi.string().min(3).required().label("title"),
    description: Joi.string().min(10).required().label("description"),
    price: Joi.number().positive().required().label("price"),
    discountPrice: Joi.number().positive().label("discountPrice"),
    stock: Joi.number().min(0).required().label("stock"),
    bannerImage: Joi.string().uri().required().label("bannerImage"),
    slideImages: Joi.array()
      .items(Joi.string().uri())
      .min(1)
      .required()
      .label("slideImages"),
  });

  return saveProductSchema.validate(payload, { abortEarly: false });
};

export const validateSaveBookPayload = (payload) => {
  const saveBookSchema = Joi.object({
    author: Joi.string().min(2).required().label("author"),
    publisher: Joi.string().required().label("publisher"),
    isbn: Joi.string().required().label("isbn"),
    genre: Joi.string().required().label("genre"),
    language: Joi.string().required().label("language"),
    pages: Joi.number().min(1).required().label("pages"),
  });

  return saveBookSchema.validate(payload, { abortEarly: false });
};

export const validateSaveClothesPayload = (payload) => {
  const saveClothesSchema = Joi.object({
    clothingType: Joi.string().required().label("clothingType"),
    brand: Joi.string().required().label("brand"),
    gender: Joi.string()
      .valid("MEN", "WOMEN", "UNISEX", "KIDS")
      .required()
      .label("gender"),
    material: Joi.string().required().label("material"),
    color: Joi.string().required().label("color"),
  });

  return saveClothesSchema.validate(payload, { abortEarly: false });
};

export const validateUpdateProductPayload = (payload) => {
  const updateProductSchema = Joi.object({
    title: Joi.string().min(3).label("title"),
    description: Joi.string().min(10).label("description"),
    price: Joi.number().positive().label("price"),
    discountPrice: Joi.number().min(0).label("discountPrice"),
    stock: Joi.number().min(0).label("stock"),
    bannerImage: Joi.string().uri().label("bannerImage"),
    slideImages: Joi.array()
      .items(Joi.string().uri())
      .min(1)
      .label("slideImages"),
    isActive: Joi.boolean().label("isActive"),
  });

  return updateProductSchema.validate(payload, { abortEarly: false });
};

export const validateUpdateBookPayload = (payload) => {
  const updateBookSchema = Joi.object({
    author: Joi.string().min(2).label("author"),
    publisher: Joi.string().label("publisher"),
    isbn: Joi.string().label("isbn"),
    genre: Joi.string().label("genre"),
    language: Joi.string().label("language"),
    pages: Joi.number().min(1).label("pages"),
  });

  return updateBookSchema.validate(payload, { abortEarly: false });
};

export const validateUpdateClothesPayload = (payload) => {
  const updateClothesSchema = Joi.object({
    clothingType: Joi.string().label("clothingType"),
    brand: Joi.string().label("brand"),
    gender: Joi.string()
      .valid("MEN", "WOMEN", "UNISEX", "KIDS")
      .label("gender"),
    material: Joi.string().label("material"),
    color: Joi.string().label("color"),
  });

  return updateClothesSchema.validate(payload, { abortEarly: false });
};
