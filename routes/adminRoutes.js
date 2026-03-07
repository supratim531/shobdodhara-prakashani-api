import { Router } from "express";
import { handleRole } from "../middlewares/roleHandler.js";
import { handleValidateToken } from "../middlewares/validateTokenHandler.js";
import {
  loginController,
  verificationController,
} from "../controllers/adminControllers.js";

const router = Router();

router.route("/auth/login").post(loginController);
router
  .route("/auth/verification")
  .post(handleValidateToken, handleRole("ADMIN"), verificationController);

export default router;
