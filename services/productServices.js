import Book from "../models/bookModel.js";
import Clothes from "../models/clothesModel.js";
import Product from "../models/productModel.js";
import { buildProductAggregationPipeline } from "../utils/query.js";
import { getPaginationParams, buildMeta } from "../utils/pagination.js";
import {
  PRODUCT_SORT_MAP,
  BOOK_SORT_MAP,
  CLOTHES_SORT_MAP,
} from "../utils/sort.js";
import {
  buildProductFilter,
  buildBookFilter,
  buildClothesFilter,
} from "../utils/filter.js";

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

const fetchAllProducts = async (query) => {
  let items, totalItems;
  const { page, perPage, skip } = getPaginationParams(query);

  if (!query.category) {
    const sortKey = PRODUCT_SORT_MAP[query.sort] ? query.sort : "newest";
    const sort = PRODUCT_SORT_MAP[sortKey];
    const productFilter = buildProductFilter(query);

    console.log(sortKey);
    console.log(sort);
    console.dir(productFilter, { depth: null });

    totalItems = await Product.find(productFilter).countDocuments();

    // .sort({ ...sort, score: { $meta: "textScore" } })
    items = await Product.find(productFilter)
      .select("-__v")
      .sort(sort)
      .skip(skip)
      .limit(perPage)
      .lean();
  } else if (query.category.toUpperCase() === "BOOK") {
    totalItems = await Book.countDocuments();
    const sortKey = BOOK_SORT_MAP[query.sort] ? query.sort : "newest";
    const sort = BOOK_SORT_MAP[sortKey];
    const bookFilter = buildBookFilter(query);

    console.log(sortKey);
    console.log(sort);
    console.dir(bookFilter, { depth: null });

    items = await Book.aggregate(
      buildProductAggregationPipeline({ filter: bookFilter })
    );
    totalItems = items.length;
    items = await Book.aggregate(
      buildProductAggregationPipeline({
        filter: bookFilter,
        sort,
        skip,
        limit: perPage,
      })
    );
  } else if (query.category.toUpperCase() === "CLOTHES") {
    const sortKey = CLOTHES_SORT_MAP[query.sort] ? query.sort : "newest";
    const sort = CLOTHES_SORT_MAP[sortKey];
    const clothesFilter = buildClothesFilter(query);

    console.log(sortKey);
    console.log(sort);
    console.dir(clothesFilter, { depth: null });

    items = await Clothes.aggregate(
      buildProductAggregationPipeline({ filter: clothesFilter })
    );
    totalItems = items.length;
    items = await Clothes.aggregate(
      buildProductAggregationPipeline({
        filter: clothesFilter,
        sort,
        skip,
        limit: perPage,
      })
    );
  } else {
    throw new Error("Invalid category");
  }

  const meta = buildMeta({
    totalItems,
    page,
    perPage,
    paginationLimit: 10,
  });

  return { items, meta };
};

const fetchProductById = async (productId) => {
  let item;
  const product = await Product.findById(productId);

  if (!product) {
    throw new Error("Product not found.");
  }

  const pipeline = buildProductAggregationPipeline({
    filter: { productId: product._id },
  });

  if (product.category === "BOOK") {
    item = await Book.aggregate(pipeline);
  } else if (product.category === "CLOTHES") {
    item = await Clothes.aggregate(pipeline);
  } else {
    throw new Error("Invalid category found!");
  }

  return item[0];
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
    throw new Error("Product not found.");
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

export { saveProduct, fetchAllProducts, fetchProductById, updateProduct };
