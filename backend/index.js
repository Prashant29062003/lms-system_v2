import express from "express";
import dotenv from "dotenv";
import connectDB from "./database/db.js";
import rateLimit from "express-rate-limit";

// Load environment variables from .env file
dotenv.config();

// Connect to database
await connectDB();

const app = express();
const PORT = process.env.PORT || 3000;

// Global Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many request from this IP, please try again after 15 minutes",
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

// server start
app.listen(PORT, () => {
  console.log(`App listening at http://localhost:${PORT}`);
});
