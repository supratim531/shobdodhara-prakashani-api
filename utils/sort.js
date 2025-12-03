export const PRODUCT_SORT_MAP = {
  // Default will be newest
  // Front end will only send one sort parameter, the data will be sorted based on strict one parameter only
  oldest: { createdAt: 1 },
  newest: { createdAt: -1 },
  priceAsc: { price: 1, _id: 1 },
  priceDesc: { price: -1, _id: -1 },
};

export const BOOK_SORT_MAP = {
  // Default will be newest
  // Front end will only send one sort parameter, the data will be sorted based on strict one parameter only
  oldest: { createdAt: 1 },
  newest: { createdAt: -1 },
  priceAsc: { "product.price": 1, _id: 1 },
  priceDesc: { "product.price": -1, _id: -1 },
};

export const CLOTHES_SORT_MAP = {
  // Default will be newest
  // Front end will only send one sort parameter, the data will be sorted based on strict one parameter only
  oldest: { createdAt: 1 },
  newest: { createdAt: -1 },
  priceAsc: { "product.price": 1, _id: 1 },
  priceDesc: { "product.price": -1, _id: -1 },
};
