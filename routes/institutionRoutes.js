import express from "express";
import { registerInstitution, loginInstitution } from "../controllers/institutionController.js";

const router = express.Router();

router.post("/register-institution", registerInstitution);
router.post("/login-institution", loginInstitution);

export default router;
