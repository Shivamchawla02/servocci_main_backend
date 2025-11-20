import express from "express";
import {
  registerStudent,
  loginStudent,
  forgotPassword,
  resetPassword,
  getProfile,
} from "../controllers/authController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Add this temporarily
console.log("AuthRoutes Loaded!"); 
router.post("/register", registerStudent);
router.post("/login", loginStudent);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.get("/profile", authMiddleware, getProfile);

export default router;
