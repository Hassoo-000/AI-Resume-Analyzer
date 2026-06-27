import dotenv from "dotenv";
dotenv.config();

// console.log("ENV CHECK:");
// console.log("CLOUD NAME:", process.env.CLOUDINARY_CLOUD_NAME);
// console.log("API KEY:", process.env.CLOUDINARY_API_KEY);
// console.log("API SECRET:", process.env.CLOUDINARY_API_SECRET);
// console.log("OPENAI KEY:", process.env.OPENAI_API_KEY);

import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import resumeRoutes from "./routes/resumeRoutes.js";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

connectDB();

const app = express();

app.use(express.json());
app.use(cors());

app.use("/api/auth", authRoutes);

app.use("/api/resume", resumeRoutes);

app.get("/", (req, res) => {
  res.json({ message: "ResumeAI Pro API Running 🚀" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});