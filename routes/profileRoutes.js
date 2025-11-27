import { Router } from "express";
import { handleRole } from "../middlewares/roleHandler.js";
import { handleValidateToken } from "../middlewares/validateTokenHandler.js";
import {
  currentProfileController,
  updateProfileController,
  saveAddressController,
  updateAddressController,
  deleteAddressController,
  setDefaultAddressController,
} from "../controllers/profileControllers.js";

const router = Router();

router
  .route("/current")
  .get(
    handleValidateToken,
    handleRole("USER", "ADMIN"),
    currentProfileController
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
  .patch(handleValidateToken, handleRole("USER"), setDefaultAddressController);

export default router;
