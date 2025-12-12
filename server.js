import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import cookieParser from "cookie-parser";
import createAdmin from "./utils/createAdmin.js";
import authRouter from "./routes/authRoutes.js";
import adminRouter from "./routes/adminRoutes.js";
import profileRouter from "./routes/profileRoutes.js";
import productRouter from "./routes/productRoutes.js";
import cartRouter from "./routes/cartRoutes.js";
import checkoutRouter from "./routes/checkoutRoutes.js";
import { connectDatabase } from "./config/dbConfig.js";
import { timers, cronScheduler } from "./utils/cronSchedular.js";
import processInactiveCarts from "./cron-jobs/processInactiveCarts.js";
import { handleGlobalError } from "./middlewares/globalErrorHandler.js";

const environment = process.env.NODE_ENV || "development";
const ENV_PATH =
  environment === "production" ? "./.env.production" : "./.env.development";

dotenv.config({ path: ENV_PATH, quiet: true });

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
//============================ cron tabs =============================//

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/profile", profileRouter);
app.use("/api/v1/product", productRouter);
app.use("/api/v1/cart", cartRouter);
app.use("/api/v1/checkout", checkoutRouter);
app.use(handleGlobalError);

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
  console.log(`Server is running at http://localhost:${PORT}`);
});
