import Book from "../models/bookModel.js";
import Clothes from "../models/clothesModel.js";
import Product from "../models/productModel.js";

const saveProduct = async (productData, categoryData) => {
  const product = await Product.create(productData);

  if (productData.category === "BOOK") {
    await Book.create({
      productId: product._id,
      ...categoryData,
    });
  } else if (productData.category === "CLOTHES") {
    await Clothes.create({
      productId: product._id,
      ...categoryData,
    });
  }

  return product;
};

export { saveProduct };
