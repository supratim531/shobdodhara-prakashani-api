import logger from "../config/loggerConfig.js";

// Middleware to log unhandled promise rejections
const logUnhandledRejection = () => {
  process.on("unhandledRejection", (reason, promise) => {
    logger.error("Unhandled Promise Rejection:", {
      reason: reason?.message || reason,
      stack: reason?.stack,
      promise: promise.toString(),
      timestamp: new Date().toISOString(),
    });
  });
};

// Middleware to log uncaught exceptions
const logUncaughtException = () => {
  process.on("uncaughtException", (error) => {
    logger.error("Uncaught Exception:", {
      errorName: error.name,
      errorMessage: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    });

    // Graceful shutdown
    process.exit(1);
  });
};

// Initialize error logging for process-level errors
const initializeErrorLogging = () => {
  logUnhandledRejection();
  logUncaughtException();

  logger.info(
    "Error logging initialized for unhandled rejections and uncaught exceptions"
  );
};

export { initializeErrorLogging };
