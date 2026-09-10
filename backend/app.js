const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const qs = require("qs");
const cookieParser = require("cookie-parser");
const path = require("path");
const helmet = require("helmet");
const morgan = require("morgan");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

const authGuard = require("./guards/auth.guard");
const errorHandler = require("./helpers/error-handler");

const userRouter = require("./routes/user.route");
const categoryRouter = require("./routes/category.route");
const customerRouter = require("./routes/customers.route");
const supplierRouter = require("./routes/supplier.route");
const productRouter = require("./routes/product.route");
const uploadRouter = require("./routes/upload.route");
const authRouter = require("./routes/auth.route");
const purchaseRouter = require("./routes/purchase.route");
const saleRouter = require("./routes/sale.route");
const reportRouter = require("./routes/report.route");
const chatRouter = require("./routes/chat.route");
const settingsRouter = require("./routes/setting.route");
const storeRouter = require("./routes/store.route");

const app = express();

const configuredOrigins = [process.env.CLIENT_DOMAIN, process.env.LOCAL_DOMAIN]
  .flatMap((value) => (value || "").split(","))
  .map((value) => value.trim())
  .filter(Boolean);

const allowOrigins = [
  ...configuredOrigins,
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5174",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.warn("CORS blocked origin:", origin, "Allowed origins:", allowOrigins);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);

app.set("query parser", (queryString) =>
  qs.parse(queryString, {
    decoder: (value) => {
      const numberValue = Number(value);
      return Number.isNaN(numberValue) ? value : numberValue;
    },
  }),
);

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 1000,
  standardHeaders: true,
  legacyHeaders: false,
});

const loginLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many sign-in attempts. Please try again in 5 minutes.",
  },
});
const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(globalLimiter);
app.use(express.json({ limit: "4mb" }));
app.use(express.urlencoded({ extended: true, limit: "4mb" }));
app.use(cookieParser());

app.use(
  helmet({
    crossOriginResourcePolicy: false,
  }),
);

// Routes
app.use("/api/auth/login", loginLimiter);
app.use("/api/auth", authRouter);
app.use("/api/chat", chatLimiter, chatRouter);
app.use("/api/store", storeRouter);

app.use("/api/users", authGuard, userRouter);
app.use("/api/customers", authGuard, customerRouter);
app.use("/api/categories", authGuard, categoryRouter);
app.use("/api/suppliers", authGuard, supplierRouter);
app.use("/api/products", authGuard, productRouter);
app.use("/api/product", authGuard, productRouter);
app.use("/api", uploadRouter);
app.use("/api/purchases", authGuard, purchaseRouter);
app.use("/api/sales", authGuard, saleRouter);
app.use("/api/settings", authGuard, settingsRouter);
app.use("/api/report", authGuard, reportRouter);

app.use("/uploads", express.static(path.join(__dirname, "upload")));

// Must remain last
app.use(errorHandler);

module.exports = app;
