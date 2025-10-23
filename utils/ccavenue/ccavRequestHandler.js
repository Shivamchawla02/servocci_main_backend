import crypto from "crypto";
import { encrypt } from "./ccavutil.js";
import dotenv from "dotenv";

dotenv.config();

export const ccavRequestHandler = (req, res) => {
  const workingKey = process.env.WORKING_KEY; // 32-bit key from CCAvenue
  const accessCode = process.env.ACCESS_CODE; // Access Code from CCAvenue

  const body = new URLSearchParams(req.body).toString();

  // Generate Md5 hash for the key and convert in base64
  const md5 = crypto.createHash("md5").update(workingKey).digest();
  const keyBase64 = Buffer.from(md5).toString("base64");

  // Initialize Vector
  const ivBase64 = Buffer.from([
    0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07,
    0x08, 0x09, 0x0a, 0x0b, 0x0c, 0x0d, 0x0e, 0x0f,
  ]).toString("base64");

  const encRequest = encrypt(body, keyBase64, ivBase64);

  const formBody = `
    <form id="nonseamless" method="post" name="redirect"
      action="https://secure.ccavenue.com/transaction/transaction.do?command=initiateTransaction">
      <input type="hidden" name="encRequest" value="${encRequest}">
      <input type="hidden" name="access_code" value="${accessCode}">
      <script type="text/javascript">document.redirect.submit();</script>
    </form>
  `;

  res.writeHead(200, { "Content-Type": "text/html" });
  res.write(formBody);
  res.end();
};
