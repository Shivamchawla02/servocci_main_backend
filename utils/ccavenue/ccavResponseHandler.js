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

      const decrypted = decrypt(encResp, workingKey);

      const responseData = Object.fromEntries(
        decrypted.split("&").map((pair) => pair.split("="))
      );

      await Payment.create({
        ...responseData,
        raw_response: decrypted,
      });

      console.log("✅ Payment saved:", responseData.order_id);

      let redirectURL = "https://www.servocci.com/payment-status";
      redirectURL += `?status=${responseData.order_status.toLowerCase()}&order_id=${responseData.order_id}`;

      const message =
        responseData.order_status === "Success"
          ? "🎉 Payment Successful"
          : "❌ Payment Failed";

      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(`
        <html>
          <head>
            <meta http-equiv="refresh" content="4;url=${redirectURL}">
            <style>
              body { font-family: Arial; text-align: center; padding: 50px; background: #f9fafb; }
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
      `);
    } catch (err) {
      console.error("❌ Error handling CCAvenue response:", err);
      res.statusCode = 500;
      res.end("Server Error");
    }
  });
};
