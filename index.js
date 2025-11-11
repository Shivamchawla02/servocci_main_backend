import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/authRoutes.js";
import freeCounsellingRoutes from "./routes/freeCounselling.js";
import emailRoutes from "./routes/emailRoutes.js";
import mbbsCollegeRoutes from "./routes/mbbsColleges.js";
import resumeRoutes from "./routes/resumeRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import jobApplicationRoutes from "./routes/jobApplicationRoutes.js";
import blogRoutes from "./routes/blogRoutes.js";
import userTestRoutes from "./routes/userTestRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import subscribeRoutes from "./routes/subscribeRoutes.js";

dotenv.config();
const app = express();

// ✅ Allowed Frontend Origins
const allowedOrigins = [
  "http://localhost:5173",
  "https://servocci.com",
  "https://www.servocci.com",
  "https://placements.servocci.com",
  "https://psychometric.servocci.com",
];

// ✅ Enable CORS — must be before any routes
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`❌ CORS blocked for origin: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

// ✅ Handle preflight OPTIONS requests globally
app.options("*", cors());

// ✅ Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api/free-counselling", freeCounsellingRoutes);
app.use("/api/counselling-requests", freeCounsellingRoutes);
app.use("/api/contact", emailRoutes);
app.use("/api/mbbs-colleges", mbbsCollegeRoutes);
app.use("/api/resumes", resumeRoutes);
app.use("/api", adminRoutes);
app.use("/api/job-applications", jobApplicationRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/user-tests", userTestRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/subscription", subscribeRoutes);

// ✅ Default routes
app.get("/", (req, res) => {
  res.send("API is running...");
});

app.get("/healthz", (req, res) => {
  res.status(200).json({ status: "ok", message: "Server is healthy" });
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => console.error("❌ MongoDB connection error:", err));
