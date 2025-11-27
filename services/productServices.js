import Book from "../models/bookModel.js";
import Clothes from "../models/clothesModel.js";
import Product from "../models/productModel.js";

const saveProduct = async (productData, categoryData) => {
  let book, clothes;
  const product = await Product.create(productData);

  try {
    if (productData.category === "BOOK") {
      book = new Book({
        productId: product._id,
        ...categoryData,
      });
      book = await book.save();
    } else if (productData.category === "CLOTHES") {
      clothes = new Clothes({
        productId: product._id,
        ...categoryData,
      });
      clothes = await clothes.save();
    }
  } catch (error) {
    await Product.findByIdAndDelete(product._id);
    throw error;
  }

  return {
    product,
    ...(book ? { book: book.toJSON() } : { clothes: clothes.toJSON() }),
  };
};

const updateProduct = async (
  productId,
  productData,
  categoryData,
  bookId,
  clothesId
) => {
  const updatedProduct = await Product.findByIdAndUpdate(
    productId,
    { $set: productData },
    { new: true }
  );

  if (!updatedProduct) {
    throw new Error("Product not found");
  }

  let book, clothes;

  if (bookId && Object.keys(categoryData).length > 0) {
    book = await Book.findByIdAndUpdate(
      bookId,
      { $set: categoryData },
      { new: true }
    );
  }

  if (clothesId && Object.keys(categoryData).length > 0) {
    clothes = await Clothes.findByIdAndUpdate(
      clothesId,
      { $set: categoryData },
      { new: true }
    );
  }

  return {
    product: updatedProduct,
    ...(book && { book: book.toJSON() }),
    ...(clothes && { clothes: clothes.toJSON() }),
  };
};

export { saveProduct, updateProduct };
