import crypto from "crypto";

// AES-128-CBC encryption for CCAvenue (base64 output)
export const encrypt = (plainText, key, iv) => {
  const cipher = crypto.createCipheriv("aes-128-cbc", key, iv);
  let encrypted = cipher.update(plainText, "utf8", "base64");
  encrypted += cipher.final("base64");
  return encrypted;
};

// AES-128-CBC decryption for CCAvenue response
export const decrypt = (encryptedText, key, iv) => {
  const decipher = crypto.createDecipheriv("aes-128-cbc", key, iv);
  let decrypted = decipher.update(encryptedText, "base64", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
};
