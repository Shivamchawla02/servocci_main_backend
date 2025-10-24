import crypto from "crypto";
import { decrypt } from "./ccavutil.js";
import Payment from "../../models/Payment.js";
import dotenv from "dotenv";

dotenv.config();

export const ccavResponseHandler = async (req, res) => {
  try {
    const encResp = req.body.encResp || req.query.encResp;

    if (!encResp) {
      console.error("No encResp received from CCAvenue");
      return res.status(400).send("No encResp received from CCAvenue");
    }

    const key = crypto.createHash("md5").update(process.env.WORKING_KEY).digest();
    const iv = Buffer.from([...Array(16).keys()]);

    const decrypted = decrypt(encResp, key, iv);

    // Convert decrypted string → object
    const responseData = Object.fromEntries(
      decrypted.split("&").map((pair) => pair.split("="))
    );

    console.log("✅ CCAvenue Response Data:", responseData);

    // Save to DB
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

    const status = (responseData.order_status || "Failure").toLowerCase();
    const redirectURL = `https://www.servocci.com/payment-status?status=${status}&order_id=${responseData.order_id}`;

    res.send(`
      <html>
        <head>
          <meta http-equiv="refresh" content="4;url=${redirectURL}">
          <title>Payment ${responseData.order_status}</title>
        </head>
        <body style="font-family:Arial;text-align:center;padding:50px;">
          <h2>${responseData.order_status === "Success" ? "🎉 Payment Successful" : "❌ Payment Failed"}</h2>
          <p>Order ID: <b>${responseData.order_id}</b></p>
          <p>Amount: ₹${responseData.amount}</p>
          <p>Redirecting...</p>
        </body>
      </html>
    `);
  } catch (err) {
    console.error("Payment Response Error:", err);
    res.status(500).send("Server Error");
  }
};
