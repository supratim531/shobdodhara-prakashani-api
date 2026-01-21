import User from "../models/userModel.js";
import Address from "../models/addressModel.js";
import { fetchUserById } from "./userServices.js";
import { saveOTP, fetchOTP } from "./otpServices.js";

const fetchCurrentProfile = async (userId) => {
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

const initiateChangeContact = async (userId, email, phone) => {
  const user = await fetchUserById(userId);

  if (user.email === email || user.phone === phone) {
    throw new Error("No changes detected.");
  }

  const contact = email ? `email:${email}` : `phone:${phone}`;
  const otp = await saveOTP(contact);

  return { contact, otp };
};

const verifyChangeContact = async (userId, contact, otp) => {
  const record = await fetchOTP(contact, otp);

  if (!record) return null;

  const [key, value] = contact.split(":");
  const user = await User.findByIdAndUpdate(
    userId,
    {
      $set: { [key]: value },
    },
    { new: true }
  );

  return user;
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

const updateAddress = async (userId, addressId, updatedAddressData) => {
  if (updatedAddressData.isDefault === true) {
    await Address.updateMany(
      { userId, _id: { $ne: addressId } },
      { $set: { isDefault: false } }
    );
  }

  const updatedAddress = await Address.findOneAndUpdate(
    { _id: addressId, userId },
    { $set: updatedAddressData },
    { new: true }
  )
    .select("-userId -createdAt -updatedAt -__v")
    .lean();

  return updatedAddress;
};

const deleteAddress = async (userId, addressId) => {
  const deletedAddress = await Address.findOneAndDelete({
    _id: addressId,
    userId,
  }).lean();

  if (deletedAddress && deletedAddress.isDefault) {
    const firstAddress = await Address.findOne({ userId })
      .sort({ createdAt: -1 })
      .lean();

    if (firstAddress) {
      await Address.findByIdAndUpdate(firstAddress._id, {
        $set: { isDefault: true },
      });
    }
  }

  return deletedAddress;
};

const updateDefaultAddress = async (userId, addressId) => {
  await Address.updateMany(
    { userId, _id: { $ne: addressId } },
    { $set: { isDefault: false } }
  );

  const updatedAddress = await Address.findOneAndUpdate(
    { _id: addressId, userId },
    { $set: { isDefault: true } },
    { new: true }
  )
    .select("-userId -createdAt -updatedAt -__v")
    .lean();

  return updatedAddress;
};

export {
  fetchCurrentProfile,
  updateProfile,
  initiateChangeContact,
  verifyChangeContact,
  saveAddress,
  updateAddress,
  deleteAddress,
  updateDefaultAddress,
};
