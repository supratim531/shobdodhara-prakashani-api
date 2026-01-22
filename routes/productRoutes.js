import { Router } from "express";
import { handleRole } from "../middlewares/roleHandler.js";
import { handleValidateToken } from "../middlewares/validateTokenHandler.js";
import {
  saveProductController,
  fetchAllProductsController,
  fetchProductByIdController,
  updateProductController,
  deleteProductController,
  deleteProductsController,
  deleteAllProductsController,
} from "../controllers/productControllers.js";

const router = Router();

router
  .route("")
  .get(fetchAllProductsController)
  .post(handleValidateToken, handleRole("ADMIN"), saveProductController)
  .delete(
    handleValidateToken,
    handleRole("ADMIN"),
    deleteAllProductsController
  );

router
  .route("/:productId")
  .get(fetchProductByIdController)
  .patch(handleValidateToken, handleRole("ADMIN"), updateProductController)
  .delete(handleValidateToken, handleRole("ADMIN"), deleteProductController);

router
  .route("/delete")
  .post(handleValidateToken, handleRole("ADMIN"), deleteProductsController);

export default router;
