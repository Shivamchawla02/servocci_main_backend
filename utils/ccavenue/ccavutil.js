import crypto from "crypto";

// AES-128-CBC encryption
export const encrypt = (plainText, key, iv) => {
  const cipher = crypto.createCipheriv("aes-128-cbc", key, iv);
  let encrypted = cipher.update(plainText, "utf8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
};

// AES-128-CBC decryption
export const decrypt = (messageHex, key, iv) => {
  const decipher = crypto.createDecipheriv("aes-128-cbc", key, iv);
  let decrypted = decipher.update(messageHex, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
};
