import crypto from "crypto";
import * as ccav from "./ccavutil.js";
import dotenv from "dotenv";

dotenv.config();

export const ccavRequestHandler = (req, res) => {
  const data = req.body; // ✅ Express already parsed JSON

  if (!data || Object.keys(data).length === 0) {
    console.error("❌ Empty request body");
    return res.status(400).send("Empty request body");
  }

  const workingKey = process.env.WORKING_KEY;
  const accessCode = process.env.ACCESS_CODE;

  try {
    // Convert object → query string
    const body = Object.entries(data)
      .map(([key, val]) => `${key}=${val}`)
      .join("&");

    const md5 = crypto.createHash("md5").update(workingKey).digest();
    const keyBase64 = Buffer.from(md5).toString("base64");
    const ivBase64 = Buffer.from([
      0x00, 0x01, 0x02, 0x03,
      0x04, 0x05, 0x06, 0x07,
      0x08, 0x09, 0x0a, 0x0b,
      0x0c, 0x0d, 0x0e, 0x0f,
    ]).toString("base64");

    const encRequest = ccav.encrypt(body, keyBase64, ivBase64);

    const html = `
      <html>
        <head><title>Redirecting...</title></head>
        <body onload="document.forms[0].submit()">
          <form
            id="nonseamless"
            method="post"
            name="redirect"
            action="https://secure.ccavenue.com/transaction/transaction.do?command=initiateTransaction"
          >
            <input type="hidden" name="encRequest" value="${encRequest}" />
            <input type="hidden" name="access_code" value="${accessCode}" />
          </form>
        </body>
      </html>
    `;

    res.setHeader("Content-Type", "text/html");
    res.send(html); // ✅ Send HTML directly
  } catch (err) {
    console.error("❌ Encryption or redirect form generation failed:", err);
    res.status(500).send("Encryption failed");
  }
};
