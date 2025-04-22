import express from "express";
import { validationResult, check, param } from "express-validator";
import { roleValidator } from "../middleware/role";
import { Role } from "../../generated/prisma/client";
import { tokenValidator, decryptionValidator, twoFactorValidator } from "../middleware/auth";
import { createApiKey, hashText } from "../crypto";
import { db } from "../db";

export const apiRouter = express.Router();

/**
 * @swagger
 * /api-keys:
 *   get:
 *     summary: Get User's API Keys
 *     description: |
 *       Retrieves the API keys associated with the authenticated user.
 *     tags: [Auth]
 *     security:
 *      - Authorization: []
 *     responses:
 *       200:
 *         description: Successfully retrieved API keys
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 apiKeys:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       expirationDate:
 *                         type: string
 *                         format: date-time
 *       400:
 *         description: Could not find API keys
 */
apiRouter.get(
  "/api-keys",
  tokenValidator,
  roleValidator(Role.USER),
  async (req, res, next) => {
    const { apiKeys } = await db.user.findUnique({
      where: req.user,
      include: { apiKeys: true },
    });

    if (!apiKeys) {
      return res.status(400).json({ error: "Could not find api keys" });
    }

    const parsedKeys = apiKeys.map((key) => {
      return {
        id: key.id,
        name: key.name,
        expirationDate: key.expirationDate,
      };
    });
    res.status(200).json({ apiKeys: parsedKeys });
  },
);

/**
 * @swagger
 * /create-api-key:
 *   post:
 *     summary: Create a new API Key
 *     description: Allows a user to create a new API key with a specified expiration time and name.
 *     tags: [Auth, 2FA]
 *     security:
 *      - Authorization: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - time
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the API key
 *               time:
 *                 type: integer
 *                 description: Expiration time in seconds (max 30 days)
 *               password:
 *                 type: string
 *                 description: Password for the user creating the API key
 *               code:
 *                 type: string
 *                 description: You two-factor authentication code, if any
 *     responses:
 *       200:
 *         description: Successfully created a new API key
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 apiKey:
 *                   type: string
 *       400:
 *         description: Bad request, missing or invalid parameters
 */
apiRouter.post(
  "/create-api-key",
  tokenValidator,
  decryptionValidator,
  twoFactorValidator,
  roleValidator(Role.USER),
  check("time")
    .exists()
    .withMessage("Missing api token time")
    .isInt()
    .withMessage("Time has to be an integer in seconds")
    .bail()
    .custom((value) => parseInt(value) <= 60 * 60 * 24 * 30)
    .withMessage("Time cannot be longer than 30 days"),
  check("name")
    .exists()
    .withMessage("Missing api key name")
    .notEmpty()
    .withMessage("Empty api key name"),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array().map((x) => x.msg) });
    }

    const apiKey = createApiKey();
    const hashedApiKey = hashText(apiKey);
    const { name, time } = req.body;
    var expirationDate = new Date();
    expirationDate.setSeconds(expirationDate.getSeconds() + time);

    await db.apiKey.create({
      data: {
        key: hashedApiKey,
        name,
        expirationDate: expirationDate.toISOString(),
        userId: req.user.id,
      },
    });

    res.status(200).json({ apiKey: apiKey });
  },
);

/**
 * @swagger
 * /remove-api-key/{keyId}:
 *   post:
 *     summary: Remove an API Key
 *     description: |
 *       Allows a user to delete an API key by its ID.
 *     tags: [Auth, 2FA]
 *     security:
 *      - Authorization: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               password:
 *                 type: string
 *                 description: The password of the user owning the api key
 *               code:
 *                 type: string
 *                 description: You two-factor authentication code, if any
 *     parameters:
 *       - in: path
 *         name: keyId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the API key to be deleted
 *     responses:
 *       200:
 *         description: Successfully removed the API key
 *       400:
 *         description: Invalid or missing key ID
 */
apiRouter.post(
  "/remove-api-key/:keyId",
  tokenValidator,
  decryptionValidator,
  twoFactorValidator,
  roleValidator(Role.USER),
  param("keyId")
    .exists()
    .withMessage("Missing key id to delete")
    .isInt()
    .withMessage("Key id must be an integer"),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array().map((x) => x.msg) });
    }

    var { keyId } = req.params;
    keyId = parseInt(keyId);

    const key = await db.apiKey.findUnique({ where: { id: keyId } });

    if (!key || key.userId != req.user.id) {
      return res.status(400).json({ error: "Invalid key id" });
    }

    await db.apiKey.delete({ where: { id: keyId } });

    res.status(200).end();
  },
);
