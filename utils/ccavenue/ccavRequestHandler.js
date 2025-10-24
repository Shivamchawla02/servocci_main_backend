import crypto from "crypto";
import { encrypt } from "./ccavutil.js";
import dotenv from "dotenv";

dotenv.config();

export const ccavRequestHandler = (req, res) => {
  const workingKey = process.env.WORKING_KEY; // from .env
  const accessCode = process.env.ACCESS_CODE; // from .env
  const merchantId = process.env.MERCHANT_ID; // from .env

  // ✅ Include merchant_id and redirect URLs in the encrypted body
  const paymentData = {
    merchant_id: merchantId,
    order_id: req.body.order_id || "ORD" + Date.now(),
    currency: "INR",
    amount: req.body.amount || "10.00",
    redirect_url: process.env.REDIRECT_URL,
    cancel_url: process.env.CANCEL_URL,
    language: "EN",
    billing_name: req.body.billing_name || "Guest User",
    billing_email: req.body.billing_email || "guest@example.com",
  };

  const body = new URLSearchParams(paymentData).toString();

  // Generate MD5 hash for key
  const md5 = crypto.createHash("md5").update(workingKey).digest();
  const keyBase64 = Buffer.from(md5).toString("base64");

  // Initialization Vector
  const ivBase64 = Buffer.from([
    0x00, 0x01, 0x02, 0x03,
    0x04, 0x05, 0x06, 0x07,
    0x08, 0x09, 0x0a, 0x0b,
    0x0c, 0x0d, 0x0e, 0x0f,
  ]).toString("base64");

  const encRequest = encrypt(body, keyBase64, ivBase64);

  // ✅ Updated live endpoint (initTrans)
  const formBody = `
    <form id="nonseamless" method="post" name="redirect"
      action="https://secure.ccavenue.com/transaction/initTrans">
      <input type="hidden" name="encRequest" value="${encRequest}">
      <input type="hidden" name="access_code" value="${accessCode}">
      <script type="text/javascript">document.redirect.submit();</script>
    </form>
  `;

  res.writeHead(200, { "Content-Type": "text/html" });
  res.write(formBody);
  res.end();
};
