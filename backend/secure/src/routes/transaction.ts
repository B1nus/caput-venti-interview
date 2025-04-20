import express from "express";
import { check, validationResult } from "express-validator";
import { db } from "../db";
import { Currency } from "../../generated/prisma/client";
import { loginValidator, tokenValidator } from "../middleware/auth";
import crypto from "crypto";

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
      .custom(async (value, { req }) => value !== req.user.name)
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
    const { id, publicKey } = req.user;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array().map((x) => x.msg) });
    }

    const { receiver, amount, currency, senderNote, receiverNote } = req.body;

    const receiverUser = await db.user.findUnique({
      where: { name: receiver },
    });
    if (!receiverUser) {
      return res.status(400).json({ error: "Receiver does not exist" });
    }

    const receiverId = receiverUser.id;
    const receiverPublicKey = receiverUser.publicKey;

    const encryptedSenderNote = crypto
      .publicEncrypt(publicKey, senderNote)
      .toString("base64");
    const encryptedReceiverNote = crypto
      .publicEncrypt(receiverPublicKey, receiverNote)
      .toString("base64");

    await db.transaction.create({
      data: {
        amount,
        currency,
        receiverNote: encryptedReceiverNote,
        senderNote: encryptedSenderNote,
        senderId: id,
        receiverId: receiverId,
      },
    });

    res.status(200).end();
  },
);

type Transaction = {
  status: string,
  amount: string,
  currency: string,
  receiver?: string,
  sender?: string,
  message?: string,
  note?: string,
};

async function formatTransaction(raw_transaction, sent: boolean, passphrase?: string) {
  const receiver = raw_transaction.receiverId ? (await db.user.findUnique({ where: { id: raw_transaction.receiverId } })) : null;
  const sender = raw_transaction.senderId ? (await db.user.findUnique({ where: { id: raw_transaction.senderId } })) : null;

  var transaction = {
    status: raw_transaction.status,
    amount: raw_transaction.amount,
    currency: raw_transaction.currency,
  };

  if (sent) {
    transaction.receiver = receiver ? receiver.name : null;
    transaction.note = passphrase ? crypto.privateDecrypt({ key: sender.privateKey, passphrase }, Buffer.from(raw_transaction.senderNote, "base64")).toString() : null;
  } else {
    transaction.sender = sender ? sender.name : null;
    transaction.note = passphrase ? crypto.privateDecrypt({ key: receiver.privateKey, passphrase }, Buffer.from(raw_transaction.receiverNote, "base64")).toString() : null;
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
  loginValidator,
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
