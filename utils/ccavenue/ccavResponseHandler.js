import crypto from "crypto";
import { decrypt } from "./ccavutil.js";
import querystring from "querystring";
import dotenv from "dotenv";
import Payment from "../../models/Payment.js"; // adjust path if needed

dotenv.config();

export const ccavResponseHandler = (req, res) => {
  const workingKey = process.env.WORKING_KEY;
  let ccavEncResponse = "";

  req.on("data", (data) => {
    ccavEncResponse += data;
  });

  req.on("end", async () => {
    const ccavPOST = querystring.parse(ccavEncResponse);
    const encryption = ccavPOST.encResp;

    const md5 = crypto.createHash("md5").update(workingKey).digest();
    const keyBase64 = Buffer.from(md5).toString("base64");
    const ivBase64 = Buffer.from([
      0x00, 0x01, 0x02, 0x03,
      0x04, 0x05, 0x06, 0x07,
      0x08, 0x09, 0x0a, 0x0b,
      0x0c, 0x0d, 0x0e, 0x0f,
    ]).toString("base64");

    const ccavResponse = decrypt(encryption, keyBase64, ivBase64);

    // Parse decrypted string into an object
    const responseData = Object.fromEntries(
      ccavResponse.split("&").map((pair) => pair.split("="))
    );

    // Save in MongoDB
    try {
      await Payment.create({
        ...responseData,
        raw_response: ccavResponse,
      });
      console.log("✅ Payment saved:", responseData.order_id);
    } catch (err) {
      console.error("❌ Error saving payment:", err.message);
    }

    // Show result on screen
    const message =
      responseData.order_status === "Success"
        ? "Payment Successful ✅"
        : "Payment Failed ❌";

    const responseHtml = `
      <html>
        <head><title>Payment Response</title></head>
        <body>
          <center>
            <h2>${message}</h2>
            <pre>${JSON.stringify(responseData, null, 2)}</pre>
          </center>
        </body>
      </html>
    `;

    res.writeHead(200, { "Content-Type": "text/html" });
    res.write(responseHtml);
    res.end();
  });
};
