import { FORBIDDEN } from "../constants/statusCodes.js";
import expressAsyncHandler from "express-async-handler";

const handleRole = (...allowedRoles) => {
  return expressAsyncHandler(async (req, res, next) => {
    if (allowedRoles.includes(req.user.role)) {
      next();
    } else {
      res.status(FORBIDDEN.code);
      res.statusMessage = FORBIDDEN.title;
      throw new Error("You are not authorized to access this route");
    }
  });
};

export { handleRole };
