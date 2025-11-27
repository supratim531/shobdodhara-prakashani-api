import { Router } from "express";
import { handleRole } from "../middlewares/roleHandler.js";
import { handleValidateToken } from "../middlewares/validateTokenHandler.js";
import {
  currentProfileController,
  updateProfileController,
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

export default router;
