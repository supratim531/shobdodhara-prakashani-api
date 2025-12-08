import { errorResponse } from "../utils/response.js";
import {
  BAD_REQUEST,
  UNAUTHORIZED,
  UNPROCESSABLE_ENTITY,
  INTERNAL_SERVER_ERROR,
} from "../constants/statusCodes.js";

export const handleGlobalError = (error, req, res, next) => {
  console.log("Error name:", error.name);

  switch (error.name) {
    case "TokenExpiredError":
      return errorResponse(
        res,
        UNAUTHORIZED.code,
        UNAUTHORIZED.title,
        error.message,
        error,
        error.stack,
        { expiredAt: error?.expiredAt }
      );

    case "JsonWebTokenError":
      return errorResponse(
        res,
        BAD_REQUEST.code,
        BAD_REQUEST.title,
        error.message,
        error,
        error.stack
      );

    case "ValidationError":
      const errorDetails = Array.isArray(error.details) ? error.details : error;
      const errorMessage = Array.isArray(error.details)
        ? error.details[0].message
        : error.message;

      return errorResponse(
        res,
        UNPROCESSABLE_ENTITY.code,
        UNPROCESSABLE_ENTITY.title,
        errorMessage,
        errorDetails,
        error.stack
      );

    case "MongoServerError":
      let duplicateKey = undefined;

      for (let key in error?.keyPattern) {
        duplicateKey = key;
      }

      const duplicateKeyValue = error?.keyValue?.[`${duplicateKey}`];

      if (duplicateKey && duplicateKeyValue) {
        return errorResponse(
          res,
          BAD_REQUEST.code,
          BAD_REQUEST.title,
          `${duplicateKey} ${duplicateKeyValue} already exists`,
          error,
          error.stack
        );
      } else {
        return errorResponse(
          res,
          INTERNAL_SERVER_ERROR.code,
          INTERNAL_SERVER_ERROR.title,
          error.message,
          error,
          error.stack
        );
      }

    case "Error":
      let statusCode = res.statusCode;
      let statusMessage = res.statusMessage;

      if (!statusMessage) {
        statusCode = INTERNAL_SERVER_ERROR.code;
        statusMessage = INTERNAL_SERVER_ERROR.title;
      }

      return errorResponse(
        res,
        statusCode,
        statusMessage,
        error.message,
        error,
        error.stack
      );

    default:
      return errorResponse(
        res,
        INTERNAL_SERVER_ERROR.code,
        INTERNAL_SERVER_ERROR.title,
        error.message,
        error,
        error.stack
      );
  }
};
