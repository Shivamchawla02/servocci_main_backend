import crypto from "crypto";
import { encrypt } from "./ccavutil.js";
import dotenv from "dotenv";

dotenv.config();

export const ccavRequestHandler = (req, res) => {
  try {
    const workingKey = process.env.WORKING_KEY;
    const accessCode = process.env.ACCESS_CODE;
    const merchantId = process.env.MERCHANT_ID;

    // Ensure amount is a string with 2 decimals
    const amount = parseFloat(req.body.amount || 10).toFixed(2);

    // Prepare payload for CCAvenue
    const paymentData = {
      merchant_id: merchantId,
      order_id: req.body.order_id || "ORD" + Date.now(),
      currency: "INR",
      amount: amount,
      redirect_url: process.env.REDIRECT_URL,
      cancel_url: process.env.CANCEL_URL,
      language: "EN",
      billing_name: req.body.billing_name || "Guest User",
      billing_email: req.body.billing_email || "guest@example.com",
    };

    // Convert to URL-encoded string
    const body = new URLSearchParams(paymentData).toString();

    console.log("✅ CCAvenue Payload:", body); // Debugging

    // AES-128-CBC encryption key & IV
    const key = crypto.createHash("md5").update(workingKey).digest();
    const iv = Buffer.from([...Array(16).keys()]);

    // Encrypt the request
    const encRequest = encrypt(body, key, iv);

    // HTML form for auto-submission
    const formBody = `
<html>
  <body>
    <form method="post" name="redirect" action="https://secure.ccavenue.com/transaction/initTrans">
      <input type="hidden" name="encRequest" value="${encRequest}">
      <input type="hidden" name="access_code" value="${accessCode}">
    </form>
    <script>document.redirect.submit();</script>
  </body>
</html>
`;

    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(formBody);
  } catch (err) {
    console.error("❌ CCAvenue Request Handler Error:", err);
    res.status(500).send("Error initiating payment. Please try again.");
  }
};
