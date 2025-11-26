import { Router } from "express";
import { loginController } from "../controllers/adminControllers.js";

const router = Router();

router.route("/login").post(loginController);

export default router;
