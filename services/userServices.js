import User from "../models/userModel.js";
import { getPaginationParams, buildMeta } from "../utils/pagination.js";

const fetchAllUsers = async (query) => {
  const { page, perPage, skip } = getPaginationParams(query);
  const [result] = await User.aggregate([
    {
      $facet: {
        data: [
          { $sort: { _id: -1 } },
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
  const items = result.data;
  const totalItems = result.totalItems;
  const meta = buildMeta({ totalItems, page, perPage, paginationLimit: 10 });

  return { items, meta };
};

const deleteUser = async (userId) => {
  return await User.findByIdAndDelete(userId);
};

const deactivateUser = async (userId) => {
  return await User.findByIdAndUpdate(
    userId,
    { isActive: false },
    { new: true }
  );
};

export { fetchAllUsers, deleteUser, deactivateUser };
