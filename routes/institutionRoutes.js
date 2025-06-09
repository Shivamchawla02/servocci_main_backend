import express from "express";
import { registerInstitution, loginInstitution } from "../controllers/institutionController.js";

const router = express.Router();

router.post("/register", registerInstitution);
router.post("/login", loginInstitution);

export default router;
