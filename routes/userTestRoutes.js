import express from "express";
import { addUserTest, getAllUserTests } from "../controllers/userTestController.js";

const router = express.Router();

// ➕ Save user test details
router.post("/add", addUserTest);

// 📋 Fetch all user test submissions
router.get("/", getAllUserTests);

export default router;
