import express from "express";
import { check, header, validationResult } from "express-validator";
import { db } from "../db";
import { Role } from "../../generated/prisma/client";
import {
  loginValidator,
  nameValidator,
  passwordValidator,
  decryptionValidator,
  tokenValidator,
  twoFactorValidator
} from "../middleware/auth";
import { hashPassword, generateKeyPair, createJwtToken, generate2FA, verify2FA, encryptBase64, decryptBase64, encrypt, decrypt } from "../crypto";

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
 *     tags: [2FA]
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
 *               code:
 *                 type: string
 *                 description: You two-factor authentication code, if any
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
authRouter.post("/login", loginValidator, twoFactorValidator, async (req, res, next) => {
  const token = createJwtToken(req.user.id);
  return res.status(200).json({ token });
});

/**
 * @swagger
 * /generate-2fa:
 *   post:
 *     summary: Generate a new TOTP secret for 2FA setup
 *     description: Generates a new time-based one-time password (TOTP) secret and stores the encrypted version in the user's record.
 *     tags: [Auth, 2FA]
 *     security:
 *       - Authorization: []
 *     requestBody:
 *       description: User login credentials
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *                 description: The password of the user.
 *               code:
 *                 type: string
 *                 description: You two-factor authentication code, if any
 *             required:
 *               - password
 *     responses:
 *       200:
 *         description: TOTP secret generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totp:
 *                   type: string
 *                   description: The newly generated TOTP secret
 *       401:
 *         description: Unauthorized - token is missing or invalid
 *       500:
 *         description: Internal server error
 */
authRouter.post("/generate-2fa", tokenValidator, decryptionValidator, twoFactorValidator, async (req, res, next) => {
  const totp = generate2FA();
  await db.user.update({ where: req.user, data: { totp: encrypt(totp) } });
  res.status(200).json({ totp });
})

/**
 * @swagger
 * /register-2fa:
 *   post:
 *     summary: Register and verify 2FA code
 *     description: Verifies the provided TOTP code with the stored secret and enables 2FA for the user if correct.
 *     tags: [Auth, 2FA]
 *     security:
 *       - Authorization: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - password
 *             properties:
 *               password:
 *                 type: string
 *                 description: Password used to decrypt the stored TOTP secret
 *               code:
 *                 type: string
 *                 description: The TOTP code from the authenticator app
 *     responses:
 *       200:
 *         description: 2FA successfully registered and enabled
 *       400:
 *         description: Bad request (missing TOTP, invalid code, or validation error)
 *       401:
 *         description: Unauthorized - token is missing or invalid
 *       500:
 *         description: Internal server error
 */
authRouter.post("/register-2fa", tokenValidator, decryptionValidator, check("code").notEmpty().withMessage("Missing authenticator code"), async (req, res, next) => {
  if (!req.user.totp) {
    return res.status(400).json({ error: "Missing time-based one-time password" });
  }

  const { password, code } = req.body;
  const totp = decrypt(req.user.totp);

  if (verify2FA(totp, code)) {
    await db.user.update({ where: req.user, data: { totpEnabled: true } });
    res.status(200).end();
  } else {
    res.status(400).json({ error: "Wrong code" });
  }
});
