import express from "express";
import { ccavRequestHandler } from "../utils/ccavenue/ccavRequestHandler.js";
import { ccavResponseHandler } from "../utils/ccavenue/ccavResponseHandler.js";

const router = express.Router();

// Route to initiate payment
router.post("/initiate", (req, res) => {
  ccavRequestHandler(req, res);
});

// Route to receive CCAvenue response
router.post("/response", (req, res) => {
  ccavResponseHandler(req, res);
});

export default router;
