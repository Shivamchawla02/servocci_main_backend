import express from "express";
import { addUserTest } from "../controllers/userTestController.js";

const router = express.Router();

router.post("/add", addUserTest);

export default router;
