import jwt from "jsonwebtoken";

const verifyRefreshToken = async (refreshToken) => {
  return new Promise((resolve, reject) => {
    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      (error, decodedRefreshToken) => {
        if (error) {
          return reject({
            error,
            message: error.message,
          });
        } else {
          return resolve({ user: decodedRefreshToken.user });
        }
      }
    );
  });
};

export default verifyRefreshToken;
