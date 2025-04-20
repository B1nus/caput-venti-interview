import express from "express";
import { check, header, validationResult } from "express-validator";
import { db } from "../db";
import { Role } from "../../generated/prisma/client";
import {
  loginValidator,
  nameValidator,
  passwordValidator,
} from "../middleware/auth";
import { hashPassword, generateKeyPair, createJwtToken } from "../crypto";

export const authRouter = express.Router();

authRouter.post(
  "/register",
  nameValidator("name"),
  passwordValidator("password"),
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
      const { privateKey, publicKey } = generateKeyPair(password);
      const hashed = hashPassword(password);

      await db.user.create({
        data: { name, password: hashed, publicKey, privateKey },
      });

      return res.status(200).end();
    }
  },
);

authRouter.post("/login", loginValidator, async (req, res, next) => {
  const token = createJwtToken(req.user.id);
  return res.status(200).json({ token });
});
