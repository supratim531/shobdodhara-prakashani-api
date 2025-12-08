import User from "../models/userModel.js";
import Coupon from "../models/couponModel.js";

const fetchCouponById = async (couponId) => {
  return await Coupon.findById(couponId);
};

const fetchCouponByCodeAndValidity = async (code) => {
  const currentDate = new Date();

  return await Coupon.findOne({
    code,
    startDate: { $lte: currentDate },
    endDate: { $gte: currentDate },
    isActive: true,
  });
};

const applyCouponToCartAndUser = async (
  coupon,
  couponDiscount,
  cart,
  userId
) => {
  // Check per-user usage
  let usedCouponRecord = null;
  const user = await User.findById(userId);

  if (user.usedCoupons && user.usedCoupons.length > 0) {
    usedCouponRecord = user.usedCoupons.find(
      (usedCoupon) => usedCoupon.couponId.toString() === coupon._id.toString()
    );
  }

  if (
    usedCouponRecord &&
    usedCouponRecord.usageCount >= coupon.perUserUsageLimit
  ) {
    throw new Error(
      "You have already used this coupon the maximum allowed times"
    );
  }

  // Increase the count of usage
  coupon.usageCount += 1;

  if (usedCouponRecord) {
    usedCouponRecord.usageCount += 1;
    user.usedCoupons = user.usedCoupons.map((usedCoupon) => {
      if (usedCoupon.couponId.toString() === coupon._id.toString()) {
        return usedCouponRecord;
      } else {
        return usedCoupon;
      }
    });
  } else {
    user.usedCoupons = user.usedCoupons || [];
    user.usedCoupons.push({ couponId: coupon._id, usageCount: 1 });
  }

  // attach the applied coupon to the cart
  cart.appliedCoupon = {
    couponId: coupon._id,
    code: coupon.code,
    discountValue: couponDiscount,
  };

  await Promise.all([coupon.save(), cart.save(), user.save()]);
};

const removeCouponFromCartAndUser = async (cart, userId) => {
  // Decrease the count of usage
  const user = await User.findById(userId);
  const couponId = cart.appliedCoupon.couponId;
  const coupon = await fetchCouponById(couponId);

  if (coupon) {
    if (coupon.usageCount) {
      coupon.usageCount -= 1;
    } else {
      coupon.usageCount = 0;
    }

    await coupon.save();
  }

  if (user.usedCoupons && user.usedCoupons.length > 0) {
    const usedCouponRecord = user.usedCoupons.find(
      (usedCoupon) => usedCoupon.couponId.toString() === couponId.toString()
    );

    if (usedCouponRecord) {
      usedCouponRecord.usageCount -= 1;

      if (!coupon || usedCouponRecord.usageCount === 0) {
        user.usedCoupons = user.usedCoupons.filter(
          (usedCoupon) => usedCoupon.couponId.toString() !== couponId.toString()
        );
      }
    }
  }

  // detach the applied coupon from the cart
  cart.appliedCoupon = undefined;

  await Promise.all([cart.save(), user.save()]);
};

export {
  fetchCouponById,
  fetchCouponByCodeAndValidity,
  applyCouponToCartAndUser,
  removeCouponFromCartAndUser,
};
