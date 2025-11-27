import Joi from "joi";

export const validateProductPayload = (payload) => {
  const productSchema = Joi.object({
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

  return productSchema.validate(payload, { abortEarly: false });
};

export const validateBookPayload = (payload) => {
  const bookSchema = Joi.object({
    author: Joi.string().min(2).required().label("author"),
    publisher: Joi.string().required().label("publisher"),
    isbn: Joi.string().required().label("isbn"),
    genre: Joi.string().required().label("genre"),
    language: Joi.string().required().label("language"),
    pages: Joi.number().min(1).required().label("pages"),
  });

  return bookSchema.validate(payload, { abortEarly: false });
};

export const validateClothesPayload = (payload) => {
  const clothesSchema = Joi.object({
    clothingType: Joi.string().required().label("clothingType"),
    brand: Joi.string().required().label("brand"),
    gender: Joi.string()
      .valid("MEN", "WOMEN", "UNISEX", "KIDS")
      .required()
      .label("gender"),
    material: Joi.string().required().label("material"),
    color: Joi.string().required().label("color"),
  });

  return clothesSchema.validate(payload, { abortEarly: false });
};
