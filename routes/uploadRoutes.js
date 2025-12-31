import { Router } from "express";
import { upload } from "../config/multerConfig.js";
import { handleRole } from "../middlewares/roleHandler.js";
import { handleValidateToken } from "../middlewares/validateTokenHandler.js";
import { uploadProductImagesController } from "../controllers/uploadControllers.js";

const router = Router();

router
  .route("/product/:category")
  .post(
    handleValidateToken,
    handleRole("ADMIN"),
    upload.array("images", 6),
    uploadProductImagesController
  );

export default router;
