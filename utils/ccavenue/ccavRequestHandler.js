import crypto from "crypto";
import * as ccav from "./ccavutil.js";
import dotenv from "dotenv";

dotenv.config();

export const ccavRequestHandler = (req, res) => {
  let body = "";

  const workingKey = process.env.WORKING_KEY; // ✅ from .env
  const accessCode = process.env.ACCESS_CODE;

  // MD5 + base64 encode key
  const md5 = crypto.createHash("md5").update(workingKey).digest();
  const keyBase64 = Buffer.from(md5).toString("base64");

  // Static IV as per CCAvenue docs
  const ivBase64 = Buffer.from([
    0x00, 0x01, 0x02, 0x03,
    0x04, 0x05, 0x06, 0x07,
    0x08, 0x09, 0x0a, 0x0b,
    0x0c, 0x0d, 0x0e, 0x0f,
  ]).toString("base64");

  req.on("data", (data) => {
    body += data;
  });

  req.on("end", () => {
    const encRequest = ccav.encrypt(body, keyBase64, ivBase64);

    const html = `
      <form id="nonseamless" method="post" name="redirect"
        action="https://secure.ccavenue.com/transaction/transaction.do?command=initiateTransaction">
        <input type="hidden" id="encRequest" name="encRequest" value="${encRequest}">
        <input type="hidden" name="access_code" id="access_code" value="${accessCode}">
        <script>document.redirect.submit();</script>
      </form>
    `;

    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(html);
  });
};
