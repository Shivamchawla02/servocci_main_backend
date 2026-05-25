import express from "express";
import { ccavRequestHandler } from "../utils/ccavenue/ccavRequestHandler.js";
import { ccavResponseHandler } from "../utils/ccavenue/ccavResponseHandler.js";

const router = express.Router();

// REAL PAYMENT
router.post("/initiate", (req, res) => {
  ccavRequestHandler(req, res);
});

// CCAvenue Response
router.post("/response", (req, res) => {
  ccavResponseHandler(req, res);
});

// TEST ACCESS
router.post("/test-access", (req, res) => {

  const { code } = req.body;

  // YOUR SECRET TESTING CODE
  if (code === "SERVOCCI_TEST_2026") {

    return res.json({
      success: true,

      redirect:
        "https://www.servocci.com/payment-success?order_id=TEST_ORDER_123&status=success",
    });
  }

  return res.status(401).json({
    success: false,
    message: "Invalid code",
  });
});

export default router;