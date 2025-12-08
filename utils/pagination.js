export const getPaginationParams = (query) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const perPage = Math.max(1, parseInt(query.perPage) || 10);

  return {
    page,
    perPage,
    skip: (page - 1) * perPage,
  };
};

export const buildMeta = ({ totalItems, page, perPage, paginationLimit }) => {
  const totalPages = Math.ceil(totalItems / perPage);

  return {
    totalItems,
    totalPages,
    page,
    perPage,
    hasNext: page < totalPages,
    hasPrev: page > 1,
    nextPage: page < totalPages ? page + 1 : null,
    prevPage: page > 1 ? page - 1 : null,
    paginationLimit: paginationLimit ?? totalPages,
  };
};
