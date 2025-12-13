import { Router } from "express";
import { handleRole } from "../middlewares/roleHandler.js";
import { handleValidateToken } from "../middlewares/validateTokenHandler.js";
import {
  fetchCurrentProfileController,
  updateProfileController,
  saveAddressController,
  updateAddressController,
  deleteAddressController,
  updateDefaultAddressController,
} from "../controllers/profileControllers.js";
import { fetchUserOrdersController, fetchOrderByIdController } from "../controllers/orderControllers.js";

const router = Router();

router
  .route("/current")
  .get(
    handleValidateToken,
    handleRole("USER", "ADMIN"),
    fetchCurrentProfileController
  )
  .patch(
    handleValidateToken,
    handleRole("USER", "ADMIN"),
    updateProfileController
  );

router
  .route("/address")
  .post(handleValidateToken, handleRole("USER"), saveAddressController);

router
  .route("/address/:addressId")
  .patch(handleValidateToken, handleRole("USER"), updateAddressController)
  .delete(handleValidateToken, handleRole("USER"), deleteAddressController);

router
  .route("/address/:addressId/default")
  .patch(
    handleValidateToken,
    handleRole("USER"),
    updateDefaultAddressController
  );

router
  .route("/orders")
  .get(handleValidateToken, handleRole("USER"), fetchUserOrdersController);

router
  .route("/orders/:orderId")
  .get(handleValidateToken, handleRole("USER"), fetchOrderByIdController);

export default router;
