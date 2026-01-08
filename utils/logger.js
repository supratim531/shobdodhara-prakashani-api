import logger from "../config/loggerConfig.js";

// Application logger utility with helper functions
class AppLogger {
  // Debug level logging
  static debug(message, meta = {}) {
    logger.debug(message, {
      ...meta,
      timestamp: new Date().toISOString(),
      level: "debug",
    });
  }

  // Info level logging
  static info(message, meta = {}) {
    logger.info(message, {
      ...meta,
      timestamp: new Date().toISOString(),
      level: "info",
    });
  }

  // Warning level logging
  static warn(message, meta = {}) {
    logger.warn(message, {
      ...meta,
      timestamp: new Date().toISOString(),
      level: "warn",
    });
  }

  // Error level logging
  static error(message, error = null, meta = {}) {
    const errorMeta = {
      ...meta,
      timestamp: new Date().toISOString(),
      level: "error",
    };

    if (error) {
      errorMeta.errorName = error.name;
      errorMeta.errorMessage = error.message;
      errorMeta.stack = error.stack;
    }

    logger.error(message, errorMeta);
  }

  // Database operation logging
  static database(operation, collection, meta = {}) {
    logger.info(`Database ${operation}: ${collection}`, {
      ...meta,
      category: "database",
      operation,
      collection,
      timestamp: new Date().toISOString(),
    });
  }

  // API operation logging
  static api(action, endpoint, meta = {}) {
    logger.info(`API ${action}: ${endpoint}`, {
      ...meta,
      category: "api",
      action,
      endpoint,
      timestamp: new Date().toISOString(),
    });
  }

  // Authentication logging
  static auth(action, userId, meta = {}) {
    logger.info(`Auth ${action}: User ${userId}`, {
      ...meta,
      category: "authentication",
      action,
      userId,
      timestamp: new Date().toISOString(),
    });
  }

  // Payment operation logging
  static payment(action, orderId, amount, meta = {}) {
    logger.info(`Payment ${action}: Order ${orderId} - Amount ${amount}`, {
      ...meta,
      category: "payment",
      action,
      orderId,
      amount,
      timestamp: new Date().toISOString(),
    });
  }

  // Business logic logging
  static business(action, entity, meta = {}) {
    logger.info(`Business Logic ${action}: ${entity}`, {
      ...meta,
      category: "business",
      action,
      entity,
      timestamp: new Date().toISOString(),
    });
  }

  // Performance logging
  static performance(operation, duration, meta = {}) {
    const level = duration > 1000 ? "warn" : "info";
    logger[level](`Performance: ${operation} took ${duration}ms`, {
      ...meta,
      category: "performance",
      operation,
      duration,
      timestamp: new Date().toISOString(),
    });
  }

  // Security logging
  static security(event, details, meta = {}) {
    logger.warn(`Security Event: ${event}`, {
      ...meta,
      category: "security",
      event,
      details,
      timestamp: new Date().toISOString(),
    });
  }
}

// Export both class and individual functions for flexibility
export default AppLogger;

// Individual function exports for direct usage
export const {
  debug,
  info,
  warn,
  error,
  database,
  api,
  auth,
  payment,
  business,
  performance,
  security,
} = AppLogger;
