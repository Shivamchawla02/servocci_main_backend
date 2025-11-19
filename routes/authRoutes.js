import express from "express";
import {
  registerStudent,
  loginWithPassword,
  forgotPassword,
  resetPassword,
  getProfile,
} from "../controllers/authController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Auth
router.post("/register", registerStudent);
router.post("/login", loginWithPassword);

// Forgot / Reset
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

// Profile
router.get("/profile", authMiddleware, getProfile);

export default router;
