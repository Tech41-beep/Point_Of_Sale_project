require("dotenv").config();
const mongoose = require("mongoose");

console.log("Connecting to MongoDB Atlas...");

mongoose
  .connect(process.env.DATABASE_URL, {
    serverSelectionTimeoutMS: 10000,
  })
  .then(() => {
    console.log("✅ MongoDB Atlas connected!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ MongoDB Atlas connection failed:");
    console.error(error.message);
    process.exit(1);
  });