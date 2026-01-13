import { Router } from "express";
import { handleRole } from "../middlewares/roleHandler.js";
import { handleValidateToken } from "../middlewares/validateTokenHandler.js";
import {
  loginController,
  verificationController,
} from "../controllers/adminControllers.js";

const router = Router();

router.route("/login").post(loginController);
router
  .route("/verification")
  .post(handleValidateToken, handleRole("ADMIN"), verificationController);

export default router;
