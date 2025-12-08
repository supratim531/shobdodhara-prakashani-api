import jwt from "jsonwebtoken";

export const generateAccessToken = (user) => {
  const payload = {
    user: {
      id: user.id,
      role: user.role,
      isOnboarded: user.isOnboarded,
    },
  };

  const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    algorithm: "HS512",
    expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
  });

  return accessToken;
};

export const generateRefreshToken = (user) => {
  const payload = {
    user: {
      id: user.id,
      role: user.role,
      isOnboarded: user.isOnboarded,
    },
  };

  const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
    algorithm: "HS512",
    expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
  });

  return refreshToken;
};
