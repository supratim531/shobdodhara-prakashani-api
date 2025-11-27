import User from "../models/userModel.js";
import Address from "../models/addressModel.js";

const currentProfile = async (userId) => {
  const user = await User.findById(userId).select("-__v").lean();
  user.addresses = await Address.find({ userId: user.id })
    .select("-userId -createdAt -updatedAt -__v")
    .lean();

  return user;
};

const updateProfile = async (userId, data) => {
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { $set: data },
    { new: true }
  )
    .select("firstName lastName gender")
    .lean();

  return updatedUser;
};

export { currentProfile, updateProfile };
