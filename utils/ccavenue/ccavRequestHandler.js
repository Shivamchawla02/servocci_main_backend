import { encrypt } from "./ccavutil.js";
import dotenv from "dotenv";

dotenv.config();

export const ccavRequestHandler = (req, res) => {
  const workingKey = process.env.WORKING_KEY;  // e.g. "ABCD1234XYZ..."
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
  const encRequest = encrypt(body, workingKey);

  const htmlForm = `
    <form id="nonseamless" method="post" name="redirect"
      action="https://secure.ccavenue.com/transaction/initTrans">
      <input type="hidden" name="encRequest" value="${encRequest}" />
      <input type="hidden" name="access_code" value="${accessCode}" />
    </form>
    <script type="text/javascript">
      document.getElementById("nonseamless").submit();
    </script>
  `;

  res.writeHead(200, { "Content-Type": "text/html" });
  res.end(htmlForm);
};
