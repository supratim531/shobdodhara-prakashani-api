import { Router } from "express";
import { handleWebhookController } from "../controllers/shiprocketControllers.js";

const router = Router();

router.route("/webhook").post(handleWebhookController);

export default router;
