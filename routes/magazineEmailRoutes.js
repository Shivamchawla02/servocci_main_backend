// routes/magazineEmailRoutes.js

import express from "express";
import { sendMagazineReminder } from "../controllers/magazineEmailController.js";

const router = express.Router();

router.post("/send-reminder", sendMagazineReminder);

export default router;
