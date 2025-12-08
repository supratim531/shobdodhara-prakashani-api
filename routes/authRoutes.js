import { Router } from "express";
import {
  authenticateController,
  verifyOTPController,
  logoutController,
} from "../controllers/authControllers.js";

const router = Router();

router.route("/authenticate").post(authenticateController);
router.route("/verify-otp").post(verifyOTPController);
router.route("/logout").post(logoutController);

export default router;
