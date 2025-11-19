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

router.post("/register", registerStudent);
router.post("/login", loginWithPassword);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.get("/profile", authMiddleware, getProfile);

export default router;
