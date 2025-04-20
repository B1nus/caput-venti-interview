import jwt from "jsonwebtoken"; // might be better to have this dependency elsewhere.
import bcrypt from "bcrypt";
import express from "express";
import { check, header, validationResult } from "express-validator";
import { db } from "../db";
import { Role } from "../../generated/prisma/client";
import {
  loginValidator,
  nameValidator,
  passwordValidator,
} from "../middleware/auth";
import crypto from "crypto";

export const authRouter = express.Router();

authRouter.post(
  "/register",
  nameValidator,
  passwordValidator,
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array().map((x) => x.msg) });
    }

    const { name, password } = req.body;
    const user = await db.user.findUnique({ where: { name } });

    if (user != null) {
      res.status(400).json({ error: "Name already taken" });
    } else {
      const hashed = bcrypt.hashSync(password, 12);

      const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
        modulusLength: 4096,
        publicKeyEncoding: {
          type: "spki",
          format: "pem",
        },
        privateKeyEncoding: {
          type: "pkcs8",
          format: "pem",
          cipher: "aes-256-cbc",
          passphrase: password,
        },
      });

      await db.user.create({
        data: { name, password: hashed, publicKey, privateKey },
      });

      return res.status(200).end();
    }
  },
);

authRouter.post("/login", loginValidator, async (req, res, next) => {
  const user = req.user;

  const jwtToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRATION_TIME,
  });
  return res.status(200).json({
    token: jwtToken,
  });
});
