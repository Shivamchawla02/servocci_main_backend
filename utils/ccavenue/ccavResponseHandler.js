import crypto from "crypto";
import { decrypt } from "./ccavutil.js";
import querystring from "querystring";
import dotenv from "dotenv";
import Payment from "../../models/Payment.js";

dotenv.config();

export const ccavResponseHandler = (req, res) => {
  const workingKey = process.env.WORKING_KEY;
  let ccavEncResponse = "";

  req.on("data", (data) => {
    ccavEncResponse += data;
  });

  req.on("end", async () => {
    try {
      const ccavPOST = querystring.parse(ccavEncResponse);
      const encResp = ccavPOST.encResp;

      const key = crypto.createHash("md5").update(workingKey).digest();
      const iv = Buffer.from([...Array(16).keys()]);

      const decrypted = decrypt(encResp, key, iv);

      const responseData = Object.fromEntries(
        decrypted.split("&").map((pair) => pair.split("="))
      );

      await Payment.create({
        order_id: responseData.order_id,
        tracking_id: responseData.tracking_id,
        bank_ref_no: responseData.bank_ref_no,
        order_status: responseData.order_status,
        failure_message: responseData.failure_message,
        payment_mode: responseData.payment_mode,
        card_name: responseData.card_name,
        status_code: responseData.status_code,
        status_message: responseData.status_message,
        billing_name: responseData.billing_name,
        billing_email: responseData.billing_email,
        currency: responseData.currency,
        amount: responseData.amount,
        raw_response: decrypted,
      });

      let redirectURL = "https://www.servocci.com/payment-status";
      if (responseData.order_status === "Success") {
        redirectURL += "?status=success&order_id=" + responseData.order_id;
      } else {
        redirectURL += "?status=failed&order_id=" + responseData.order_id;
      }

      const message =
        responseData.order_status === "Success"
          ? "🎉 Payment Successful"
          : "❌ Payment Failed";

      const responseHtml = `
        <html>
          <head>
            <title>Payment ${responseData.order_status}</title>
            <meta http-equiv="refresh" content="4;url=${redirectURL}">
            <style>
              body { font-family: Arial; background: #f9fafb; color: #333; text-align: center; padding: 50px; }
              .box { background: white; padding: 40px; border-radius: 10px; display: inline-block; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
              h2 { color: ${responseData.order_status === "Success" ? "#16a34a" : "#dc2626"}; }
            </style>
          </head>
          <body>
            <div class="box">
              <h2>${message}</h2>
              <p>Order ID: <b>${responseData.order_id}</b></p>
              <p>Amount: ₹${responseData.amount}</p>
              <p>Status: ${responseData.order_status}</p>
              <p>Redirecting you to Servocci...</p>
            </div>
          </body>
        </html>
      `;

      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(responseHtml);
    } catch (err) {
      console.error("❌ Error handling payment response:", err.message);
      res.statusCode = 500;
      res.end("Server Error");
    }
  });
};
