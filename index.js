import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.js";
import freeCounsellingRoutes from "./routes/freeCounselling.js";
import emailRoutes from "./routes/emailRoutes.js"; // 👈 Add this line
import mbbsCollegeRoutes from "./routes/mbbsColleges.js";
import resumeRoutes from "./routes/resumeRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import jobApplicationRoutes from "./routes/jobApplicationRoutes.js";
import blogRoutes from "./routes/blogRoutes.js"; 
import userTestRoutes from './routes/userTestRoutes.js';

dotenv.config();
const app = express();

const allowedOrigins = [
  "https://servocci.com",
  "https://placements.servocci.com"
];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like mobile apps or curl)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PATCH", "DELETE"],
    credentials: true,
  })
);


app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/free-counselling", freeCounsellingRoutes);
app.use("/api/counselling-requests", freeCounsellingRoutes);
app.use("/api/contact", emailRoutes); // 👈 Add this line
app.use("/api/mbbs-colleges", mbbsCollegeRoutes);
app.use("/api/resumes", resumeRoutes);
app.use("/api", adminRoutes);
app.use("/api/job-applications", jobApplicationRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/user-test", userTestRoutes);

app.get("/", (req, res) => {
  res.send("API is running...");
});

app.get("/healthz", (req, res) => {
  res.status(200).json({ status: "ok", message: "Server is healthy" });
});

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.error("MongoDB connection error:", err));
