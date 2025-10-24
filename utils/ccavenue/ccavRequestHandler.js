import crypto from "crypto";
import { encrypt } from "./ccavutil.js";
import dotenv from "dotenv";

dotenv.config();

export const ccavRequestHandler = (req, res) => {
  const workingKey = process.env.WORKING_KEY;
  const accessCode = process.env.ACCESS_CODE;
  const merchantId = process.env.MERCHANT_ID;

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

  // Raw AES-128-CBC key & IV
  const key = crypto.createHash("md5").update(workingKey).digest();
  const iv = Buffer.from([...Array(16).keys()]);

  const encRequest = encrypt(body, key, iv);

  const formBody = `
    <form method="post" name="redirect" action="https://secure.ccavenue.com/transaction/initTrans">
      <input type="hidden" name="encRequest" value="${encRequest}">
      <input type="hidden" name="access_code" value="${accessCode}">
      <script>document.redirect.submit();</script>
    </form>
  `;

  res.writeHead(200, { "Content-Type": "text/html" });
  res.write(formBody);
  res.end();
};
