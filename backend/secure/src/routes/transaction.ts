import express from "express";
import { check, validationResult } from "express-validator";
import { db } from "../db";
import { Currency } from "../../generated/prisma/client";
import { loginValidator, tokenValidator, decryptionValidator } from "../middleware/auth";
import { encryptBase64, decryptBase64 } from "../crypto"; 

export const transactionRouter = express.Router();

transactionRouter.post(
  "/send",
  tokenValidator,
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

async function formatTransaction(rawTransaction, sent: boolean, passphrase?: string) {
  const receiver = rawTransaction.receiverId ? (await db.user.findUnique({ where: { id: rawTransaction.receiverId } })) : null;
  const sender = rawTransaction.senderId ? (await db.user.findUnique({ where: { id: rawTransaction.senderId } })) : null;

  var transaction = {
    status: rawTransaction.status,
    amount: rawTransaction.amount,
    currency: rawTransaction.currency,
  };

  if (sent) {
    transaction.receiver = receiver ? receiver.name : null;
    transaction.note = passphrase ? decryptBase64(sender.privateKey, passphrase, rawTransaction.senderNote) : null;
  } else {
    transaction.sender = sender ? sender.name : null;
    transaction.note = passphrase ? decryptBase64(receiver.privateKey, passphrase, rawTransaction.receiverNote) : null;
  }

  return transaction;
}

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

transactionRouter.get(
  "/transactions/decrypt",
  tokenValidator,
  decryptionValidator,
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
