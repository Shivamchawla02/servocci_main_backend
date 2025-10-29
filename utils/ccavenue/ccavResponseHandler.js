import crypto from "crypto";
import ccav from "./ccavutil.js";
import dotenv from "dotenv";
import qs from "querystring";
import Payment from "../../models/Payment.js"; // ✅ make sure this path is correct

dotenv.config();

export const ccavResponseHandler = async (req, res) => {
  let ccavEncResponse = "";
  const workingKey = process.env.WORKING_KEY;

  // Generate base64 key + IV
  const md5 = crypto.createHash("md5").update(workingKey).digest();
  const keyBase64 = Buffer.from(md5).toString("base64");
  const ivBase64 = Buffer.from([
    0x00, 0x01, 0x02, 0x03,
    0x04, 0x05, 0x06, 0x07,
    0x08, 0x09, 0x0a, 0x0b,
    0x0c, 0x0d, 0x0e, 0x0f,
  ]).toString("base64");

  req.on("data", (data) => {
    ccavEncResponse += data;
  });

  req.on("end", async () => {
    try {
      const ccavPOST = qs.parse(ccavEncResponse);
      const encResp = ccavPOST.encResp;
      const decrypted = ccav.decrypt(encResp, keyBase64, ivBase64);

      // Parse decrypted response into object
      const pairs = decrypted.split("&");
      const responseData = {};
      pairs.forEach((pair) => {
        const [key, value] = pair.split("=");
        responseData[key] = value;
      });

      // ✅ Save transaction data in MongoDB
      await Payment.create({
        order_id: responseData.order_id,
        tracking_id: responseData.tracking_id,
        bank_ref_no: responseData.bank_ref_no,
        order_status: responseData.order_status,
        failure_message: responseData.failure_message,
        payment_mode: responseData.payment_mode,
        card_name: responseData.card_name,
        currency: responseData.currency,
        amount: responseData.amount,
        billing_name: responseData.billing_name,
        billing_email: responseData.billing_email,
        billing_tel: responseData.billing_tel,
        billing_address: responseData.billing_address,
        billing_city: responseData.billing_city,
        billing_state: responseData.billing_state,
        billing_zip: responseData.billing_zip,
        billing_country: responseData.billing_country,
        status_message: responseData.status_message,
        raw_response: decrypted,
      });

      console.log("✅ Payment saved to DB:", responseData.order_status);

      // ✅ Redirect user based on payment status
      if (responseData.order_status === "Success") {
        return res.redirect("https://www.servocci.com/payment-success");
      } else {
        return res.redirect("https://www.servocci.com/payment-failed");
      }
    } catch (error) {
      console.error("❌ Error processing CCAvenue response:", error);
      res.status(500).send("Error handling payment response.");
    }
  });
};
