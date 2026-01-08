import path from "path";
import winston from "winston";
import { Logtail } from "@logtail/node";
import { LogtailTransport } from "@logtail/winston";
import DailyRotateFile from "winston-daily-rotate-file";

// Create a Logtail client
const logtail = new Logtail(process.env.BETTERSTACK_SOURCE_TOKEN, {
  endpoint: process.env.BETTERSTACK_INGESTING_URL,
});

// Custom format for log messages
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    let log = `${timestamp} [${level.toUpperCase()}]: ${message}`;
    if (stack) log += `\n${stack}`;
    if (Object.keys(meta).length > 0)
      log += `\n${JSON.stringify(meta, null, 2)}`;
    return log;
  })
);

// Get current date for folder structure
const getCurrentDate = () => new Date().toISOString().split("T")[0];

// Custom filename with actual time format
const getFilenameWithTime = (type) => {
  const now = new Date();
  const date = now.toISOString().split("T")[0]; // YYYY-MM-DD
  const time = now.toTimeString().split(" ")[0].replace(/:/g, "-"); // HH-MM-SS
  // return `${type}_${date}T${time}`;
  return `${type}`;
};

// All logs transport (info, warn, error, debug)
const allLogsTransport = new DailyRotateFile({
  dirname: path.join(process.cwd(), "logs", "all"),
  filename: getFilenameWithTime("all"),
  datePattern: "YYYY-MM-DD",
  maxSize: "5m",
  maxFiles: "30d",
  format: logFormat,
  level: "debug",
  extension: ".log",
  zippedArchive: true,
});

// Error logs transport (error level only)
const errorLogsTransport = new DailyRotateFile({
  dirname: path.join(process.cwd(), "logs", "errors"),
  filename: getFilenameWithTime("error"),
  datePattern: "YYYY-MM-DD",
  maxSize: "5m",
  maxFiles: "30d",
  format: logFormat,
  level: "warn",
  extension: ".log",
  zippedArchive: true,
});

// Console transport for development
const consoleTransport = new winston.transports.Console({
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.simple()
  ),
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
});

// Create base transports array
const transports = [
  allLogsTransport,
  errorLogsTransport,
  consoleTransport,
  new LogtailTransport(logtail),
];

// Create Winston logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: logFormat,
  transports: transports,
  exitOnError: false,
});

// Handle transport events for daily folder creation
allLogsTransport.on("new", (filename) => {
  const date = getCurrentDate();
  allLogsTransport.dirname = path.join(process.cwd(), "logs", "all", date);
});

errorLogsTransport.on("new", (filename) => {
  const date = getCurrentDate();
  errorLogsTransport.dirname = path.join(process.cwd(), "logs", "errors", date);
});

// Add error handling for logger itself
logger.on("error", (error) => {
  console.error("Logger error:", error);
});

export default logger;
