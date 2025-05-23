import jwt from "jsonwebtoken";
import crypto from "crypto";
import bcrypt from "bcrypt";
import speakeasy from "speakeasy";
import cryptojs from "crypto-js";

export function generateKeyPair(passphrase: string): {
  publicKey: string;
  privateKey: string;
} {
  return crypto.generateKeyPairSync("rsa", {
    modulusLength: 4096,
    publicKeyEncoding: {
      type: "spki",
      format: "pem",
    },
    privateKeyEncoding: {
      type: "pkcs8",
      format: "pem",
      cipher: "aes-256-cbc",
      passphrase,
    },
  });
}

export function encryptBase64(publicKey: string, text: string): string {
  return crypto.publicEncrypt(publicKey, text).toString("base64");
}

export function decryptBase64(
  key: string,
  passphrase: string,
  base64: string,
): string {
  return crypto
    .privateDecrypt({ key, passphrase }, Buffer.from(base64, "base64"))
    .toString();
}

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 12);
}

export function checkPassword(password: string, hashed: string): boolean {
  return bcrypt.compareSync(password, hashed);
}

export function createApiKey(): string {
  const buffer = crypto.randomBytes(32);
  return buffer.toString("hex");
}

export function hashText(text: string): string {
  return crypto
    .createHmac("sha1", process.env.HMAC_SECRET)
    .update(text)
    .digest("hex");
}

export function createJwtToken(userId: number): string {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRATION_TIME,
  });
}

export function verifyJwtToken(token: string): number {
  return jwt.verify(token, process.env.JWT_SECRET);
}

export function generate2FA(): string {
  return speakeasy.generateSecret({ length: 8 }).base32;
}

export function verify2FA(base32, code): boolean {
  return speakeasy.totp.verify({
    secret: base32,
    encoding: "base32",
    token: code,
    window: 6,
  });
}


export function encrypt(text): string {
  return cryptojs.AES.encrypt(text, process.env.AES_SECRET).toString();
}

export function decrypt(base64): string {
  const decrypted = cryptojs.AES.decrypt(base64, process.env.AES_SECRET);
  return decrypted.toString(cryptojs.enc.Utf8);
}
