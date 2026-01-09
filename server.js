import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import cookieParser from "cookie-parser";
import authRouter from "./routes/authRoutes.js";
import adminRouter from "./routes/adminRoutes.js";
import uploadRouter from "./routes/uploadRoutes.js";
import profileRouter from "./routes/profileRoutes.js";
import productRouter from "./routes/productRoutes.js";
import couponRouter from "./routes/couponRoutes.js";
import cartRouter from "./routes/cartRoutes.js";
import checkoutRouter from "./routes/checkoutRoutes.js";
import paymentRouter from "./routes/paymentRoutes.js";
import orderRouter from "./routes/orderRoutes.js";
import createAdmin from "./utils/createAdmin.js";
import { connectDatabase } from "./config/dbConfig.js";
import { timers, cronScheduler } from "./utils/cronSchedular.js";
import { handleGlobalError } from "./middlewares/globalErrorHandler.js";
import initializeShiprocket from "./utils/initializeShiprocket.js";
import processInactiveCarts from "./cron-jobs/processInactiveCarts.js";
import refreshShiprocketToken from "./cron-jobs/refreshShiprocketToken.js";
import processExpiredReservations from "./cron-jobs/processExpiredReservations.js";

import AppLogger from "./utils/logger.js";
import { initializeErrorLogging } from "./middlewares/errorLogger.js";
import {
  requestLogger,
  requestBodyLogger,
} from "./middlewares/requestLogger.js";

const environment = process.env.NODE_ENV || "development";
const ENV_PATH =
  environment === "production" ? "./.env.production" : "./.env.development";

dotenv.config({ path: ENV_PATH, quiet: true });

// Initialize logging system
initializeErrorLogging();
AppLogger.info("Logging system initialized", { environment });

connectDatabase();

const app = express();
const PORT = process.env.PORT || 5000;

// const allowedOrigins = ["http://localhost:3000"];
const corsOptions = {
  origin: (origin, callback) => {
    // if (!origin || allowedOrigins.includes(origin)) {
    //   callback(null, true); // allow
    // } else {
    //   callback(new Error("Not allowed by CORS"));
    // }

    callback(null, true); // allow every origin
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
};

//============================ cron tabs =============================//
cronScheduler(timers.everyMinute, processInactiveCarts);
cronScheduler(timers.everyMinute, processExpiredReservations);
cronScheduler(timers.everyTweleveHour, refreshShiprocketToken);
//============================ cron tabs =============================//

app.set("trust proxy", true);

app.use(cors(corsOptions));
app.use(requestLogger);
app.use(cookieParser());
app.use(express.json());
app.use(requestBodyLogger);
app.use("/public", express.static("public"));
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/upload", uploadRouter);
app.use("/api/v1/profile", profileRouter);
app.use("/api/v1/product", productRouter);
app.use("/api/v1/coupon", couponRouter);
app.use("/api/v1/cart", cartRouter);
app.use("/api/v1/checkout", checkoutRouter);
app.use("/api/v1/payment", paymentRouter);
app.use("/api/v1/order", orderRouter);
app.use(handleGlobalError);

// Log server initialization
AppLogger.info("All routes and middlewares configured");

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Node.js server is up and running!",
  });
});

app.get("/health", (req, res) => {
  res.status(200).json({
    message: "Backend server is healthy and running! 😊",
  });
});

app.listen(PORT, () => {
  createAdmin();
  initializeShiprocket();

  // Log server startup
  AppLogger.info(`Server started successfully`, {
    port: PORT,
    environment,
    nodeVersion: process.version,
    timestamp: new Date().toISOString(),
  });

  console.log(`Server is running at http://localhost:${PORT}`);
});
