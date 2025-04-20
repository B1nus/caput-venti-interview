import jwt from "jsonwebtoken";
import crypto from "crypto";
import bcrypt from "bcrypt";

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

export function createJwtToken(userId: number): string {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRATION_TIME,
  });
}

export function verifyJwtToken(token: string): number {
  return jwt.verify(token, process.env.JWT_SECRET);
}
