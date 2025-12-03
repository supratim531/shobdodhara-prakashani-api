import { Router } from "express";
import { handleRole } from "../middlewares/roleHandler.js";
import { handleValidateToken } from "../middlewares/validateTokenHandler.js";
import { fetchOrSaveActiveCartController } from "../controllers/cartControllers.js";

const router = Router();

router
  .route("")
  .get(
    handleValidateToken,
    handleRole("USER"),
    fetchOrSaveActiveCartController
  );

export default router;
