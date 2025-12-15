export function buildProductAggregationPipeline({ filter, sort, skip, limit }) {
  const pipeline = [];

  pipeline.push(
    {
      $lookup: {
        from: "products",
        localField: "productId",
        foreignField: "_id",
        as: "product",
      },
    },

    // Convert array → single object
    { $unwind: "$product" },

    // Apply filters on joined data
    { $match: filter }
  );

  if (sort && Object.keys(sort).length) {
    // $sort: { ...sort, score: { $meta: "textScore" } }
    pipeline.push({ $sort: sort });
  }

  if ((skip || limit) && !sort) {
    pipeline.push({ $sort: { _id: -1 } });
  }

  if (typeof skip === "number" && skip >= 0) {
    pipeline.push({ $skip: skip });
  }

  if (typeof limit === "number" && limit > 0) {
    pipeline.push({ $limit: limit });
  }

  // Final projection of the aggregated object
  pipeline.push({
    $project: {
      __v: 0,
      product: {
        _id: 0,
        __v: 0,
        createdAt: 0,
        updatedAt: 0,
      },
    },
  });

  return pipeline;
}
