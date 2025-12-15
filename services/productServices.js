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

    const [result] = await Product.aggregate([
      { $match: productFilter },

      {
        $facet: {
          data: [
            // $sort: { ...sort, score: { $meta: "textScore" } }
            { $sort: sort || { _id: -1 } },
            { $skip: skip },
            { $limit: perPage },
            {
              $project: {
                __v: 0,
              },
            },
          ],

          totalCount: [{ $count: "count" }],
        },
      },

      {
        $addFields: {
          totalItems: {
            $ifNull: [{ $arrayElemAt: ["$totalCount.count", 0] }, 0],
          },
        },
      },

      { $project: { data: 1, totalItems: 1 } },
    ]);
    items = result.data;
    totalItems = result.totalItems;
  } else if (query.category.toUpperCase() === "BOOK") {
    totalItems = await Book.countDocuments();
    const sortKey = BOOK_SORT_MAP[query.sort] ? query.sort : "newest";
    const sort = BOOK_SORT_MAP[sortKey];
    const bookFilter = buildBookFilter(query);

    console.log(sortKey);
    console.log(sort);
    console.dir(bookFilter, { depth: null });

    const [result] = await Book.aggregate(
      buildProductAggregationPipeline({
        filter: bookFilter,
        sort,
        skip,
        limit: perPage,
      })
    );
    items = result?.data || [];
    totalItems = result?.totalItems || 0;
  } else if (query.category.toUpperCase() === "CLOTHES") {
    const sortKey = CLOTHES_SORT_MAP[query.sort] ? query.sort : "newest";
    const sort = CLOTHES_SORT_MAP[sortKey];
    const clothesFilter = buildClothesFilter(query);

    console.log(sortKey);
    console.log(sort);
    console.dir(clothesFilter, { depth: null });

    const [result] = await Clothes.aggregate(
      buildProductAggregationPipeline({
        filter: clothesFilter,
        sort,
        skip,
        limit: perPage,
      })
    );
    items = result?.data || [];
    totalItems = result?.totalItems || 0;
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
    const [result] = await Book.aggregate(pipeline);
    item = result.data;
  } else if (product.category === "CLOTHES") {
    const [result] = await Clothes.aggregate(pipeline);
    item = result.data;
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
