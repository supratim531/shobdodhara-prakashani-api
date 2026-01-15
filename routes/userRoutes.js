import { Router } from "express";
import { handleRole } from "../middlewares/roleHandler.js";
import { handleValidateToken } from "../middlewares/validateTokenHandler.js";
import {
  fetchAllUsersController,
  deactivateUserController,
  deleteUserController,
} from "../controllers/userControllers.js";

const router = Router();

router
  .route("")
  .get(handleValidateToken, handleRole("ADMIN"), fetchAllUsersController);

router
  .route("/:userId/deactivate")
  .patch(handleValidateToken, handleRole("ADMIN"), deactivateUserController);

router
  .route("/:userId")
  .delete(handleValidateToken, handleRole("ADMIN"), deleteUserController);

export default router;
