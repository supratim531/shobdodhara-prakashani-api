export function buildProductAggregationPipeline({
  query,
  filter,
  sort,
  skip,
  limit,
}) {
  const pipeline = [];
  const dataPipeline = [];

  pipeline.push(
    // Apply query search on searchKeywords
    {
      $match: {
        $text: { $search: query },
      },
    },

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
    { $match: filter },
  );

  if (sort && Object.keys(sort).length) {
    dataPipeline.push({ $sort: sort });
    // dataPipeline.push({ $sort: { ...sort, score: { $meta: "textScore" } } });
  }

  if ((skip || limit) && !sort) {
    dataPipeline.push({ $sort: { _id: -1 } });
  }

  if (typeof skip === "number" && skip >= 0) {
    dataPipeline.push({ $skip: skip });
  }

  if (typeof limit === "number" && limit > 0) {
    dataPipeline.push({ $limit: limit });
  }

  // Final projection of the aggregated object
  dataPipeline.push({
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

  // Facet for data + total count
  pipeline.push({
    $facet: {
      data: dataPipeline,
      totalCount: [{ $count: "count" }],
    },
  });

  // Normalize totalItems
  pipeline.push({
    $addFields: {
      // score: { $meta: "textScore" },
      totalItems: {
        $ifNull: [{ $arrayElemAt: ["$totalCount.count", 0] }, 0],
      },
    },
  });

  // Final response shape
  pipeline.push({
    $project: {
      data: 1,
      totalItems: 1,
    },
  });

  return pipeline;
}
