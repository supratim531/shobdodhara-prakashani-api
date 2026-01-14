import { Router } from "express";
import { handleRole } from "../middlewares/roleHandler.js";
import { handleValidateToken } from "../middlewares/validateTokenHandler.js";
import {
  fetchAllUsersController,
  deleteUserController,
  deactivateUserController,
} from "../controllers/userControllers.js";

const router = Router();

router
  .route("")
  .get(handleValidateToken, handleRole("ADMIN"), fetchAllUsersController);

router
  .route("/:userId")
  .delete(handleValidateToken, handleRole("ADMIN"), deleteUserController);

router
  .route("/deactivate/:userId")
  .delete(handleValidateToken, handleRole("ADMIN"), deactivateUserController);

export default router;
