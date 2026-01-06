import { successResponse } from "../utils/response.js";
import expressAsyncHandler from "express-async-handler";
import {
  fetchAllCoupons,
  saveCoupon,
  updateCoupon,
} from "../services/couponServices.js";
import {
  validateSaveCouponPayload,
  validateUpdateCouponPayload,
} from "../validators/couponValidators.js";
import {
  CREATED,
  BAD_REQUEST,
  NOT_FOUND,
  UNPROCESSABLE_ENTITY,
  INTERNAL_SERVER_ERROR,
} from "../constants/statusCodes.js";

/**
 * @description Save a new coupon
 * @route POST /api/v1/coupon
 * @access private (role: ADMIN)
 */
const saveCouponController = expressAsyncHandler(async (req, res) => {
  const { value: couponData, error } = validateSaveCouponPayload(req.body);

  if (error) {
    res.status(UNPROCESSABLE_ENTITY.code);
    res.statusMessage = UNPROCESSABLE_ENTITY.title;
    throw error;
  }

  try {
    const coupon = await saveCoupon(couponData);

    return successResponse(
      res,
      "Coupon saved successfully!",
      coupon,
      CREATED.code
    );
  } catch (error) {
    if (error.code === 11000) {
      res.status(BAD_REQUEST.code);
      res.statusMessage = BAD_REQUEST.title;
      throw new Error("Coupon code already exists");
    } else {
      res.status(INTERNAL_SERVER_ERROR.code);
      res.statusMessage = INTERNAL_SERVER_ERROR.title;
    }

    throw error;
  }
});

/**
 * @description Get all coupons
 * @route GET /api/v1/coupon
 * @access public
 */
const fetchAllCouponsController = expressAsyncHandler(async (req, res) => {
  try {
    const coupons = await fetchAllCoupons();

    return successResponse(res, "All coupons fetched.", coupons);
  } catch (error) {
    res.status(INTERNAL_SERVER_ERROR.code);
    res.statusMessage = INTERNAL_SERVER_ERROR.title;
    throw error;
  }
});

/**
 * @description Update an existing coupon
 * @route PATCH /api/v1/coupon/:code
 * @access private (role: ADMIN)
 */
const updateCouponController = expressAsyncHandler(async (req, res) => {
  const { value: couponData, error } = validateUpdateCouponPayload(req.body);

  if (error) {
    res.status(UNPROCESSABLE_ENTITY.code);
    res.statusMessage = UNPROCESSABLE_ENTITY.title;
    throw error;
  }

  try {
    const coupon = await updateCoupon(req.params.code, couponData);

    return successResponse(res, "Coupon updated successfully!", coupon);
  } catch (error) {
    if (error.message === "Coupon not found.") {
      res.status(NOT_FOUND.code);
      res.statusMessage = NOT_FOUND.title;
    } else {
      res.status(BAD_REQUEST.code);
      res.statusMessage = BAD_REQUEST.title;
    }

    throw error;
  }
});

export {
  saveCouponController,
  fetchAllCouponsController,
  updateCouponController,
};
