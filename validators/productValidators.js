import Joi from "joi";

export const validateSaveProductPayload = (payload) => {
  const saveProductSchema = Joi.object({
    category: Joi.string()
      .valid("BOOK", "CLOTHES")
      .required()
      .label("category"),
    sku: Joi.string().required().label("sku"),
    title: Joi.string().min(3).required().label("title"),
    description: Joi.string().min(10).required().label("description"),
    price: Joi.number().positive().required().label("price"),
    discountPrice: Joi.number().positive().label("discountPrice"),
    stock: Joi.number().min(0).required().label("stock"),
    totalSales: Joi.number().min(0).optional().label("totalSales"),
    bannerImage: Joi.string().required().label("bannerImage"),
    slideImages: Joi.array()
      .items(Joi.string())
      .min(0)
      .required()
      .label("slideImages"),
    length: Joi.number().min(0.6).required().label("length"),
    breadth: Joi.number().min(0.6).required().label("breadth"),
    height: Joi.number().min(0.6).required().label("height"),
    weight: Joi.number().min(0.1).required().label("weight"),
    publishedAt: Joi.date().iso().required().label("publishedAt"), // published date format (YYYY-MM-DD)
    showYearOnly: Joi.boolean().label("showYearOnly"),
  });

  return saveProductSchema.validate(payload, { abortEarly: false });
};

export const validateSaveBookPayload = (payload) => {
  const saveBookSchema = Joi.object({
    author: Joi.string().min(2).required().label("author"),
    coEditor: Joi.string().min(2).empty("").optional().label("coEditor"),
    publisher: Joi.string().required().label("publisher"),
    isbn: Joi.string().empty("").optional().label("isbn"),
    genre: Joi.string().required().label("genre"),
    language: Joi.string().required().label("language"),
    pages: Joi.number().min(1).required().label("pages"),
    binding: Joi.string().required().label("binding"),
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
    sku: Joi.string().label("sku"),
    title: Joi.string().min(3).label("title"),
    description: Joi.string().min(10).label("description"),
    price: Joi.number().positive().label("price"),
    discountPrice: Joi.number().min(0).label("discountPrice"),
    stock: Joi.number().min(0).label("stock"),
    totalSales: Joi.number().min(0).label("totalSales"),
    bannerImage: Joi.string().label("bannerImage"),
    slideImages: Joi.array().items(Joi.string()).min(0).label("slideImages"),
    length: Joi.number().min(0.6).label("length"),
    breadth: Joi.number().min(0.6).label("breadth"),
    height: Joi.number().min(0.6).label("height"),
    weight: Joi.number().min(0.1).label("weight"),
    publishedAt: Joi.date().iso().label("publishedAt"), // published date (YYYY-MM-DD)
    showYearOnly: Joi.boolean().label("showYearOnly"),
    isActive: Joi.boolean().label("isActive"),
  });

  return updateProductSchema.validate(payload, { abortEarly: false });
};

export const validateUpdateBookPayload = (payload) => {
  const updateBookSchema = Joi.object({
    author: Joi.string().min(2).label("author"),
    coEditor: Joi.string().min(2).allow("").label("coEditor"),
    publisher: Joi.string().label("publisher"),
    isbn: Joi.string().allow("").label("isbn"),
    genre: Joi.string().label("genre"),
    language: Joi.string().label("language"),
    pages: Joi.number().min(1).label("pages"),
    binding: Joi.string().label("binding"),
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

export const validateDeleteProductsPayload = (payload) => {
  const deleteProductsSchema = Joi.object({
    productIds: Joi.array()
      .items(Joi.string().required())
      .min(1)
      .required()
      .label("productIds"),
  });

  return deleteProductsSchema.validate(payload, { abortEarly: false });
};
