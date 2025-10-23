import { encrypt, decrypt } from "./ccavutil.js";
import crypto from "crypto";

// ✅ Use your actual working key from CCAvenue
const workingKey = "E8743DD8CB4B6935516C307C467C5B4"; 

// Generate MD5 hash of the working key (CCAvenue requirement)
const md5 = crypto.createHash("md5").update(workingKey).digest();
const keyBase64 = Buffer.from(md5).toString("base64");

// Static IV (Initialization Vector) used by CCAvenue
const ivBase64 = Buffer.from([
  0x00, 0x01, 0x02, 0x03,
  0x04, 0x05, 0x06, 0x07,
  0x08, 0x09, 0x0a, 0x0b,
  0x0c, 0x0d, 0x0e, 0x0f,
]).toString("base64");

// Sample data to test encryption
const plainText = "order_id=12345&amount=500&currency=INR";

// Encrypt using ccavutil.js helper
const encrypted = encrypt(plainText, keyBase64, ivBase64);
console.log("Encrypted:", encrypted);

// Decrypt back to verify correctness
const decrypted = decrypt(encrypted, keyBase64, ivBase64);
console.log("Decrypted:", decrypted);
