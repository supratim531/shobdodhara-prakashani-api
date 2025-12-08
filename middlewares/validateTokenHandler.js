import jwt from "jsonwebtoken";
import expressAsyncHandler from "express-async-handler";
import { UNAUTHORIZED } from "../constants/statusCodes.js";
import verifyRefreshToken from "../utils/verifyRefreshToken.js";

const handleValidateToken = expressAsyncHandler(async (req, res, next) => {
  // const accessToken = req.headers["access-token"];
  // const refreshToken = req.headers["refresh-token"];
  const accessToken =
    req.cookies?.["access-token"] || req.headers["access-token"];
  const refreshToken =
    req.cookies?.["refresh-token"] || req.headers["refresh-token"];

  if (!accessToken || !refreshToken) {
    res.status(UNAUTHORIZED.code);
    res.statusMessage = UNAUTHORIZED.title;
    throw new Error("User is not authorized or token is missing");
  } else {
    try {
      const decodedAccessToken = jwt.verify(
        accessToken,
        process.env.ACCESS_TOKEN_SECRET
      );

      req.user = decodedAccessToken.user;
      next();
    } catch (error) {
      // handle accessToken expiration
      try {
        const payload = await verifyRefreshToken(refreshToken);
        const newAccessToken = jwt.sign(
          payload,
          process.env.ACCESS_TOKEN_SECRET,
          {
            algorithm: "HS512",
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
          }
        );

        res.cookie("access-token", newAccessToken, {
          httpOnly: true,
          secure: true,
          sameSite: "strict",
        });
        req.user = payload.user;
        next();
      } catch (error) {
        res.status(UNAUTHORIZED.code);
        res.statusMessage = UNAUTHORIZED.title;
        throw error.error;
      }
    }
  }
});

export { handleValidateToken };
