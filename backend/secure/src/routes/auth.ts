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

/**
 * @swagger
 * /register:
 *   post:
 *     summary: Registers a new user
 *     description: This endpoint allows a user to register with a name and password. The name must be unique, and the password is hashed before storage.
 *     requestBody:
 *       description: User registration data
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the user.
 *               password:
 *                 type: string
 *                 description: The password of the user.
 *             required:
 *               - name
 *               - password
 *     responses:
 *       200:
 *         description: User registered successfully
 *       400:
 *         description: Invalid input or name already taken
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: A list of error messages
 *       500:
 *         description: Internal server error
 *
 */
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

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Logs in an existing user
 *     description: This endpoint authenticates a user and returns a JWT token for subsequent requests.
 *     requestBody:
 *       description: User login credentials
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the user.
 *               password:
 *                 type: string
 *                 description: The password of the user.
 *             required:
 *               - name
 *               - password
 *     responses:
 *       200:
 *         description: Login successful, JWT token returned
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: The JWT token for authenticated requests
 *       400:
 *         description: Invalid credentials
 *       500:
 *         description: Internal server error
 */
authRouter.post("/login", loginValidator, async (req, res, next) => {
  const token = createJwtToken(req.user.id);
  return res.status(200).json({ token });
});
