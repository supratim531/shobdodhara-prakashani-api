import User from "../models/userModel.js";
import Address from "../models/addressModel.js";

const currentProfile = async (userId) => {
  const user = await User.findById(userId).select("-__v").lean();
  user.addresses = await Address.find({ userId })
    .select("-userId -createdAt -updatedAt -__v")
    .lean();

  return user;
};

const updateProfile = async (userId, updatedUserData) => {
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { $set: updatedUserData },
    { new: true }
  )
    .select("firstName lastName gender")
    .lean();

  return updatedUser;
};

const saveAddress = async (userId, addressData) => {
  const existingAddressCount = await Address.countDocuments({ userId });

  if (existingAddressCount === 0) {
    addressData.isDefault = true;
  }

  const address = await Address.create({
    userId,
    ...addressData,
  });

  return address;
};

export { currentProfile, updateProfile, saveAddress };
