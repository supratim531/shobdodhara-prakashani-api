// Add "product." before each key in the passed object
function prefixProduct(object) {
  const result = {};

  for (const key in object) {
    result[`product.${key}`] = object[key];
  }

  return result;
}

// Build mongo filter dynamically from query params for products only
export function buildProductFilter(query) {
  const filter = {};

  // filter for price range = { ..., price: { $gte: 500, $lte: 1000 } }
  if (query.minPrice || query.maxPrice) {
    filter.price = {};
    const minPrice = Number(query.minPrice);
    const maxPrice = Number(query.maxPrice);
    if (!Number.isNaN(minPrice)) filter.price.$gte = minPrice;
    if (!Number.isNaN(maxPrice)) filter.price.$lte = maxPrice;
  }

  // filter for price range = { ..., stock: { $gt, $eq } }
  if (query.inStock) {
    filter.stock = {};
    if (query.inStock === "true") filter.stock.$gt = 0;
    else if (query.inStock === "false") filter.stock.$eq = 0;
  }

  // text search (search for the applied index on title and description)
  if (query.query) {
    filter.$text = { $search: query.query };
    // filter.score = { $meta: "textScore" }
  }

  return filter;
}

// Build mongo filter dynamically from query params for books only
export function buildBookFilter(query) {
  const filter = {};

  // filter for ISBN (exact match)
  if (query.isbn) {
    filter.isbn = query.isbn.trim();
  }

  // filter for author (case-insensitive partial match)
  if (query.author) {
    filter.author = { $regex: query.author.trim(), $options: "i" };
  }

  // filter for publisher (case-insensitive partial match)
  if (query.publisher) {
    filter.publisher = { $regex: query.publisher.trim(), $options: "i" };
  }

  // Example: ?genre=fiction,mystery
  // filter for single or multiple genres = { ..., genre: { $in: ["romance", "fiction"] } }
  if (query.genre) {
    const genres = query.genre.split(",").map((g) => g.trim());
    filter.genre = { $in: genres };
  }

  // filter for language = { ..., language: "" }
  if (query.language) {
    filter.language = query.language.trim();
  }

  // filter for range of pages = { ..., pages: { $gte, $lte } }
  if (query.minPages || query.maxPages) {
    filter.pages = {};
    const minPages = Number(query.minPages);
    const maxPages = Number(query.maxPages);
    if (!Number.isNaN(minPages)) filter.pages.$gte = minPages;
    if (!Number.isNaN(maxPages)) filter.pages.$lte = maxPages;
  }

  // text search (search for the applied index on author, publisher and genre)
  if (query.query) {
    filter.$text = { $search: query.query };
    // filter.score = { $meta: "textScore" }
  }

  // final combined filter: book + product filters with "product." prefixed keys
  const finalFilter = {
    ...filter,
    ...prefixProduct(buildProductFilter(query)),
  };

  return finalFilter;
}

// Build mongo filter dynamically from query params for clothes only
export function buildClothesFilter(query) {
  const filter = {};

  // filter for clothingType (case-insensitive partial match)
  if (query.clothingType) {
    filter.clothingType = { $regex: query.clothingType.trim(), $options: "i" };
  }

  // filter for brand (case-insensitive partial match)
  if (query.brand) {
    filter.brand = { $regex: query.brand.trim(), $options: "i" };
  }

  // filter for gender (single exact value)
  if (query.gender) {
    filter.gender = query.gender.trim().toUpperCase(); // MEN | WOMEN | UNISEX | KIDS
  }

  // Example: ?color=red,blue,green
  // filter for single or multiple colors = { ..., color: { $in: ["red", "blue"] } }
  if (query.color) {
    const colors = query.color.split(",").map((c) => c.trim());
    filter.color = { $in: colors };
  }

  // filter for material (case-insensitive partial match)
  if (query.material) {
    filter.material = { $regex: query.material.trim(), $options: "i" };
  }

  // text search (search for the applied index on clothingType, brand, and color)
  if (query.query) {
    filter.$text = { $search: query.query };
    // filter.score = { $meta: "textScore" }
  }

  // final combined filter: clothes + product filters with "product." prefixed keys
  const finalFilter = {
    ...filter,
    ...prefixProduct(buildProductFilter(query)),
  };

  return finalFilter;
}
