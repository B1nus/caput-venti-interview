import express from "express";
import { check, validationResult } from "express-validator";
import { db } from "../db";
import { Currency } from "../../generated/prisma/client";
import {
  loginValidator,
  tokenValidator,
  decryptionValidator,
  twoFactorValidator,
} from "../middleware/auth";
import { encryptBase64, decryptBase64 } from "../crypto";

export const transactionRouter = express.Router();

/**
 * @swagger
 * /send:
 *   post:
 *     summary: Sends a transaction to another user
 *     description: This endpoint allows a user to send a transaction to another user. The transaction includes an amount, currency, and notes for both the sender and the receiver.
 *     tags: [Auth]
 *     security:
 *      - Authorization: []
 *     requestBody:
 *       description: Transaction data
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *                 description: The password of the sender.
 *               receiver:
 *                 type: string
 *                 description: The name of the receiver.
 *               amount:
 *                 type: string
 *                 description: The amount to send.
 *               currency:
 *                 type: string
 *                 description: The currency for the transaction.
 *               senderNote:
 *                 type: string
 *                 description: A note from the sender.
 *               receiverNote:
 *                 type: string
 *                 description: A note for the receiver.
 *             required:
 *               - password
 *               - receiver
 *               - amount
 *               - currency
 *               - senderNote
 *               - receiverNote
 *     responses:
 *       200:
 *         description: Transaction sent successfully
 *       400:
 *         description: Bad request, invalid input or receiver does not exist
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       401:
 *         description: Unauthorized, invalid or missing token
 *       500:
 *         description: Internal server error
 */
transactionRouter.post(
  "/send",
  tokenValidator,
  decryptionValidator,
  twoFactorValidator,
  [
    check("receiver")
      .exists()
      .withMessage("Receiver name missing")
      .notEmpty()
      .withMessage("Receiver name cannot be empty")
      .isString()
      .trim()
      .escape()
      .custom((value, { req }) => value !== req.user.name)
      .withMessage("Receiver cannot be the same as sender"),
    check("amount")
      .exists()
      .withMessage("Transaction amount missing")
      .notEmpty()
      .withMessage("Transaction amount cannot be empty")
      .isFloat()
      .withMessage("Transaction amount must be a float"),
    check("currency")
      .exists()
      .withMessage("Currency missing for transaction")
      .notEmpty()
      .withMessage("Currency cannot be empty")
      .isString()
      .trim()
      .escape()
      .custom((value) => {
        return Object.keys(Currency).includes(value);
      })
      .withMessage(
        `Currency must be one of ${Object.keys(Currency).join(", ")}`,
      ),
    check("senderNote")
      .exists()
      .withMessage("Transaction senderNote missing")
      .bail()
      .isString()
      .trim()
      .escape(),
    check("receiverNote")
      .exists()
      .withMessage("Transaction receiverNote missing")
      .bail()
      .isString()
      .trim()
      .escape(),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array().map((x) => x.msg) });
    }

    const { id, publicKey } = req.user;

    const { receiver, amount, currency, senderNote, receiverNote } = req.body;

    const receiverUser = await db.user.findUnique({
      where: { name: receiver },
    });
    if (!receiverUser) {
      return res.status(400).json({ error: "Receiver does not exist" });
    }

    const receiverId = receiverUser.id;
    const receiverPublicKey = receiverUser.publicKey;

    await db.transaction.create({
      data: {
        amount,
        currency,
        receiverNote: encryptBase64(receiverPublicKey, receiverNote),
        senderNote: encryptBase64(publicKey, senderNote),
        senderId: id,
        receiverId,
      },
    });

    res.status(200).end();
  },
);

async function formatTransaction(
  rawTransaction,
  sent: boolean,
  passphrase?: string,
) {
  const receiver = rawTransaction.receiverId
    ? await db.user.findUnique({ where: { id: rawTransaction.receiverId } })
    : null;
  const sender = rawTransaction.senderId
    ? await db.user.findUnique({ where: { id: rawTransaction.senderId } })
    : null;

  var transaction = {
    status: rawTransaction.status,
    amount: rawTransaction.amount,
    currency: rawTransaction.currency,
  };

  if (sent) {
    transaction.receiver = receiver ? receiver.name : null;
    transaction.note = passphrase
      ? decryptBase64(sender.privateKey, passphrase, rawTransaction.senderNote)
      : null;
  } else {
    transaction.sender = sender ? sender.name : null;
    transaction.note = passphrase
      ? decryptBase64(
          receiver.privateKey,
          passphrase,
          rawTransaction.receiverNote,
        )
      : null;
  }

  return transaction;
}

/**
 * @swagger
 * /transactions:
 *   get:
 *     summary: Retrieves a list of all transactions for the authenticated user
 *     description: This endpoint returns a list of transactions (both sent and received) for the authenticated user.
 *     tags: [Auth]
 *     security:
 *      - Authorization: []
 *     responses:
 *       200:
 *         description: List of transactions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   type:
 *                     type: string
 *                     description: The type of transaction (SENT or RECEIVED)
 *                   amount:
 *                     type: string
 *                   currency:
 *                     type: string
 *                   note:
 *                     type: string
 *                     description: The transaction note (decrypted for SENT transactions).
 *                   sender:
 *                     type: string
 *                     description: The sender's name (for RECEIVED transactions).
 *                   receiver:
 *                     type: string
 *                     description: The receiver's name (for SENT transactions).
 *       401:
 *         description: Unauthorized, invalid or missing token
 *       500:
 *         description: Internal server error
 */
transactionRouter.get(
  "/transactions",
  tokenValidator,
  async (req, res, next) => {
    const { sentTransactions, receivedTransactions } = await db.user.findUnique(
      {
        where: req.user,
        include: {
          sentTransactions: true,
          receivedTransactions: true,
        },
      },
    );

    var transactionList = [];
    for (const sent of sentTransactions) {
      transactionList.push({
        type: "SENT",
        ...(await formatTransaction(sent, true)),
      });
    }

    for (const received of receivedTransactions) {
      transactionList.push({
        type: "RECIEVED",
        ...(await formatTransaction(received, false)),
      });
    }

    res.status(200).json(transactionList);
  },
);

/**
 * @swagger
 * /transactions/decrypt:
 *   get:
 *     summary: Retrieves a list of transactions with decrypted notes for the authenticated user
 *     description: This endpoint retrieves transactions for the authenticated user and decrypts the transaction notes using a passphrase.
 *     tags: [Auth]
 *     security:
 *      - Authorization: []
 *     requestBody:
 *       description: Passphrase for decrypting transaction notes
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *                 description: The passphrase used to decrypt transaction notes.
 *             required:
 *               - password
 *     responses:
 *       200:
 *         description: List of transactions with decrypted notes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   type:
 *                     type: string
 *                     description: The type of transaction (SENT or RECEIVED)
 *                   amount:
 *                     type: string
 *                   currency:
 *                     type: string
 *                   note:
 *                     type: string
 *                     description: The decrypted transaction note.
 *                   sender:
 *                     type: string
 *                     description: The sender's name (for RECEIVED transactions).
 *                   receiver:
 *                     type: string
 *                     description: The receiver's name (for SENT transactions).
 *       400:
 *         description: Invalid passphrase or missing password
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       401:
 *         description: Unauthorized, invalid or missing token
 *       500:
 *         description: Internal server error
 */
transactionRouter.get(
  "/transactions/decrypt",
  tokenValidator,
  decryptionValidator,
  twoFactorValidator,
  async (req, res, next) => {
    const { password } = req.body;

    const { sentTransactions, receivedTransactions } = await db.user.findUnique(
      {
        where: req.user,
        include: {
          sentTransactions: true,
          receivedTransactions: true,
        },
      },
    );

    var transactionList = [];
    for (const sent of sentTransactions) {
      transactionList.push({
        type: "SENT",
        ...(await formatTransaction(sent, true, password)),
      });
    }

    for (const received of receivedTransactions) {
      transactionList.push({
        type: "RECIEVED",
        ...(await formatTransaction(received, false, password)),
      });
    }

    res.status(200).json(transactionList);
  },
);
