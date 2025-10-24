import crypto from "crypto";

// Encrypt (CCAvenue format)
export const encrypt = (plainText, workingKey) => {
  const key = crypto.createHash("md5").update(workingKey).digest(); // AES-128 key
  const iv = Buffer.alloc(16, "\0"); // 16 null bytes
  const cipher = crypto.createCipheriv("aes-128-cbc", key, iv);

  let encrypted = cipher.update(plainText, "utf8", "base64");
  encrypted += cipher.final("base64");
  return encrypted;
};

// Decrypt (CCAvenue format)
export const decrypt = (encText, workingKey) => {
  const key = crypto.createHash("md5").update(workingKey).digest();
  const iv = Buffer.alloc(16, "\0");
  const decipher = crypto.createDecipheriv("aes-128-cbc", key, iv);

  let decrypted = decipher.update(encText, "base64", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
};
