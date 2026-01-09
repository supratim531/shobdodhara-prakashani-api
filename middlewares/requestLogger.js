import morgan from "morgan";
import logger from "../config/loggerConfig.js";

// Custom Morgan format for detailed request logging
const morganFormat =
  ':remote-addr - [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" - :response-time ms';

// Add custom token before creating morgan middleware
morgan.token("real-ip", (req) => {
  return (
    req.headers["x-forwarded-for"] ||
    req.headers["x-real-ip"] ||
    req.socket.remoteAddress ||
    req.ip
  );
});

// Custom stream to integrate Morgan with Winston
const morganStream = {
  write: (message) => {
    // Remove trailing newline from Morgan message
    const logMessage = message.trim();

    // Parse status code to determine log level
    const statusMatch = logMessage.match(/HTTP\/[\d.]+"\s(\d{3})/);
    const statusCode = statusMatch ? parseInt(statusMatch[1]) : 200;

    // Log based on status code
    if (statusCode >= 500) {
      logger.error(`HTTP Request: ${logMessage}`);
    } else if (statusCode >= 400) {
      logger.warn(`HTTP Request: ${logMessage}`);
    } else {
      logger.info(`HTTP Request: ${logMessage}`);
    }
  },
};

// Create Morgan middleware with custom configuration
const requestLogger = morgan(morganFormat, {
  stream: morganStream,
  skip: (req, res) => {
    // Skip logging for health check endpoints in production
    if (process.env.NODE_ENV === "production") {
      return req.url === "/health" || req.url === "/";
    }
    return false;
  },
});

// Additional middleware to log request body for POST/PUT/PATCH requests
const requestBodyLogger = (req, res, next) => {
  if (["POST", "PUT", "PATCH"].includes(req.method) && req.body) {
    // Filter sensitive data from logs
    const sanitizedBody = { ...req.body };

    // Remove sensitive fields
    const sensitiveFields = [
      "password",
      "token",
      "secret",
      "key",
      "authorization",
    ];
    sensitiveFields.forEach((field) => {
      if (sanitizedBody[field]) {
        sanitizedBody[field] = "[REDACTED]";
      }
    });

    logger.info(`Request Body [${req.method} ${req.url}]:`, sanitizedBody);
  }
  next();
};

export { requestLogger, requestBodyLogger };
