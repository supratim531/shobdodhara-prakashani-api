import { Router } from "express";
import { handleRole } from "../middlewares/roleHandler.js";
import { handleValidateToken } from "../middlewares/validateTokenHandler.js";
import {
  fetchCurrentProfileController,
  updateProfileController,
  initiateChangeContactController,
  verifyChangeContactController,
  saveAddressController,
  updateAddressController,
  deleteAddressController,
  updateDefaultAddressController,
} from "../controllers/profileControllers.js";

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
  .route("/current/change-contact/initiate")
  .post(
    handleValidateToken,
    handleRole("USER", "ADMIN"),
    initiateChangeContactController
  );

router
  .route("/current/change-contact/verify")
  .post(
    handleValidateToken,
    handleRole("USER", "ADMIN"),
    verifyChangeContactController
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

export default router;
