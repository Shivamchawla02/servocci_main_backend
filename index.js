import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.js";
import freeCounsellingRoutes from "./routes/freeCounselling.js";
import emailRoutes from "./routes/emailRoutes.js"; // 👈 Add this line
import mbbsCollegeRoutes from "./routes/mbbsColleges.js";

dotenv.config();
const app = express();

app.use(cors({
  origin: "https://servocci.com",
  credentials: true,
}));

app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/free-counselling", freeCounsellingRoutes);
app.use("/api/contact", emailRoutes); // 👈 Add this line
app.use("/api/mbbs-colleges", mbbsCollegeRoutes);

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
