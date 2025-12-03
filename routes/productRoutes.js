import { Router } from "express";
import { handleRole } from "../middlewares/roleHandler.js";
import { handleValidateToken } from "../middlewares/validateTokenHandler.js";
import {
  saveProductController,
  fetchAllProductsController,
  fetchProductByIdController,
  updateProductController,
} from "../controllers/productControllers.js";

const router = Router();

router
  .route("")
  .get(fetchAllProductsController)
  .post(handleValidateToken, handleRole("ADMIN"), saveProductController);

router
  .route("/:productId")
  .get(fetchProductByIdController)
  .patch(handleValidateToken, handleRole("ADMIN"), updateProductController);

export default router;
