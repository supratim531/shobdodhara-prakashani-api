import { Router } from "express";
import { handleRole } from "../middlewares/roleHandler.js";
import { handleValidateToken } from "../middlewares/validateTokenHandler.js";

const router = Router();

router
  .route("")
  .get(handleValidateToken, handleRole("USER"), async (req, res) => {});

export default router;
