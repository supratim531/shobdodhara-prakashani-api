import { Router } from "express";
import { handleRole } from "../middlewares/roleHandler.js";
import { handleValidateToken } from "../middlewares/validateTokenHandler.js";
import {
  saveCouponController,
  fetchAllCouponsController,
  fetchCouponByIdController,
  updateCouponController,
} from "../controllers/couponControllers.js";

const router = Router();

router
  .route("/")
  .get(fetchAllCouponsController)
  .post(handleValidateToken, handleRole("ADMIN"), saveCouponController);

router
  .route("/:couponId")
  .get(handleValidateToken, handleRole("ADMIN"), fetchCouponByIdController)
  .patch(handleValidateToken, handleRole("ADMIN"), updateCouponController);

export default router;
