import crypto from "crypto";
import * as ccav from "./ccavutil.js";
import dotenv from "dotenv";

dotenv.config();

export const ccavRequestHandler = (req, res) => {
  let body = "";

  const workingKey = process.env.WORKING_KEY;
  const accessCode = process.env.ACCESS_CODE;

  // MD5 hash of working key
  const md5 = crypto.createHash("md5").update(workingKey).digest();
  const keyBase64 = Buffer.from(md5).toString("base64");

  // Static IV as per CCAvenue docs
  const ivBase64 = Buffer.from([
    0x00, 0x01, 0x02, 0x03,
    0x04, 0x05, 0x06, 0x07,
    0x08, 0x09, 0x0a, 0x0b,
    0x0c, 0x0d, 0x0e, 0x0f,
  ]).toString("base64");

  req.on("data", (chunk) => {
    body += chunk;
  });

  req.on("end", () => {
    console.log("🟦 Raw request body received:", body); // 👈 LOG THIS

    if (!body) {
      console.error("❌ Empty request body. Nothing to encrypt.");
      return res.status(400).send("Empty request body");
    }

    try {
      const encRequest = ccav.encrypt(body, keyBase64, ivBase64);
      console.log("🟨 Encrypted request:", encRequest); // 👈 LOG THIS TOO

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
              <input type="hidden" id="encRequest" name="encRequest" value="${encRequest}">
              <input type="hidden" name="access_code" id="access_code" value="${accessCode}">
            </form>
          </body>
        </html>
      `;

      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(html);
    } catch (err) {
      console.error("❌ Encryption or redirect form generation failed:", err);
      res.status(500).send("Encryption failed");
    }
  });
};
