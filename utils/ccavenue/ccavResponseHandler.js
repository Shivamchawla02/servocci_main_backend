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

      // Decrypt the response
      const md5 = crypto.createHash("md5").update(workingKey).digest();
      const keyBase64 = Buffer.from(md5).toString("base64");
      const ivBase64 = Buffer.from([
        0x00, 0x01, 0x02, 0x03,
        0x04, 0x05, 0x06, 0x07,
        0x08, 0x09, 0x0a, 0x0b,
        0x0c, 0x0d, 0x0e, 0x0f,
      ]).toString("base64");

      const decrypted = decrypt(encResp, keyBase64, ivBase64);

      // Convert response string (a=b&c=d) → JS Object
      const responseData = Object.fromEntries(
        decrypted.split("&").map((pair) => pair.split("="))
      );

      // ✅ Save payment info in MongoDB
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

      console.log("✅ Payment saved:", responseData.order_id);

      // ✅ Prepare frontend redirect
      let redirectURL = "https://www.servocci.com/payment-status";
      if (responseData.order_status === "Success") {
        redirectURL += "?status=success&order_id=" + responseData.order_id;
      } else {
        redirectURL += "?status=failed&order_id=" + responseData.order_id;
      }

      // ✅ Display friendly response + auto redirect
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
