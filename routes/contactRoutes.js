import express from "express";
import { sendContactEmail } from "../controllers/ContactController.js";

const router = express.Router();

router.post("/contact", sendContactEmail);

export default router;
