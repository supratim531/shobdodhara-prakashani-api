import { successResponse } from "../utils/response.js";
import expressAsyncHandler from "express-async-handler";
import {
  fetchAllCoupons,
  fetchCouponById,
  saveCoupon,
  updateCoupon,
  deleteCoupon,
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
    const coupons = await fetchAllCoupons(req.query);

    return successResponse(res, "All coupons fetched.", coupons);
  } catch (error) {
    res.status(INTERNAL_SERVER_ERROR.code);
    res.statusMessage = INTERNAL_SERVER_ERROR.title;
    throw error;
  }
});

/**
 * @description Find a coupon by its id
 * @route GET /api/v1/coupon/:couponId
 * @access private (role: ADMIN)
 */
const fetchCouponByIdController = expressAsyncHandler(async (req, res) => {
  try {
    const coupon = await fetchCouponById(req.params.couponId);

    if (!coupon) {
      res.status(NOT_FOUND.code);
      res.statusMessage = NOT_FOUND.title;
      throw new Error("Coupon not found.");
    }

    return successResponse(res, "Coupon fetched.", coupon);
  } catch (error) {
    if (error.message === "Coupon not found.") {
      res.status(NOT_FOUND.code);
      res.statusMessage = NOT_FOUND.title;
    } else {
      res.status(INTERNAL_SERVER_ERROR.code);
      res.statusMessage = INTERNAL_SERVER_ERROR.title;
    }

    throw error;
  }
});

/**
 * @description Update an existing coupon
 * @route PATCH /api/v1/coupon/:couponId
 * @access private (role: ADMIN)
 */
const updateCouponController = expressAsyncHandler(async (req, res) => {
  const { value: updatedCouponData, error } = validateUpdateCouponPayload(
    req.body
  );

  if (error) {
    res.status(UNPROCESSABLE_ENTITY.code);
    res.statusMessage = UNPROCESSABLE_ENTITY.title;
    throw error;
  }

  try {
    const coupon = await updateCoupon(req.params.couponId, updatedCouponData);

    return successResponse(res, "Coupon updated successfully!", coupon);
  } catch (error) {
    if (error.message === "Coupon not found.") {
      res.status(NOT_FOUND.code);
      res.statusMessage = NOT_FOUND.title;
    } else if (error.code === 11000) {
      res.status(BAD_REQUEST.code);
      res.statusMessage = BAD_REQUEST.title;
      throw new Error("Coupon code already exists");
    } else {
      res.status(BAD_REQUEST.code);
      res.statusMessage = BAD_REQUEST.title;
    }

    throw error;
  }
});

/**
 * @description Delete a coupon by ID
 * @route DELETE /api/v1/coupon/:couponId
 * @access private (role: ADMIN)
 */
const deleteCouponController = expressAsyncHandler(async (req, res) => {
  try {
    const deletedCoupon = await deleteCoupon(req.params.couponId);

    return successResponse(res, "Coupon deleted successfully!", deletedCoupon);
  } catch (error) {
    if (error.message === "Coupon not found.") {
      res.status(NOT_FOUND.code);
      res.statusMessage = NOT_FOUND.title;
    } else {
      res.status(INTERNAL_SERVER_ERROR.code);
      res.statusMessage = INTERNAL_SERVER_ERROR.title;
    }

    throw error;
  }
});

export {
  saveCouponController,
  fetchAllCouponsController,
  fetchCouponByIdController,
  updateCouponController,
  deleteCouponController,
};
