import express from "express";
import { validationResult } from "express-validator";
import { db } from "../db";
import { Role } from "../../generated/prisma/client";
import { tokenValidator, decryptionValidator, passwordValidator } from "../middleware/auth";
import { generateKeyPair, encryptBase64, decryptBase64, hashPassword } from "../crypto";

export const userRouter = express.Router();

userRouter.post("/unregister", tokenValidator, async (req, res, next) => {
  const { id } = req.user;
  await db.user.delete({ where: { id } });
  res.status(200).end();
  next();
});

userRouter.post("/password", tokenValidator, decryptionValidator, passwordValidator("newPassword"), async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array().map((x) => x.msg) });
  }

  const oldPassword = req.body.password;
  const newPassword = req.body.newPassword;

  if (oldPassword == newPassword) {
    return res.status(400).json({ error: "newPassword cannot be the same as your old password" });
  }

  const keyPair = generateKeyPair(newPassword);
  const newPrivateKey = keyPair.privateKey;
  const newPublicKey = keyPair.publicKey;

  const { sentTransactions, receivedTransactions } = await db.user.findUnique(
    {
      where: req.user,
      include: {
        sentTransactions: true,
        receivedTransactions: true,
      },
    },
  );

  // Decrypt with old password and encrypt with new password.
  for (const sent of sentTransactions) {
    const encryptedNote = sent.senderNote;
    const decryptedNote = decryptBase64(req.user.privateKey, oldPassword, encryptedNote);
    const newEncryptedNote = encryptBase64(newPublicKey, decryptedNote);
    await db.transaction.update({ where: sent, data: { senderNote: newEncryptedNote } });
  }

  // Decrypt with old password and encrypt with new password.
  for (const received of receivedTransactions) {
    const encryptedNote = receiver.receiverNote;
    const decryptedNote = decryptBase64(req.user.privateKey, oldPassword, encryptedNote);
    const newEncryptedNote = encryptBase64(newPublicKey, decryptedNote);
    await db.transaction.update({ where: received, data: { receiverNote: newEncryptedNote }});
  }

  await db.user.update({ where: req.user, data: { password: hashPassword(newPassword), privateKey: newPrivateKey, publicKey: newPublicKey }});
  res.status(200).end();
});
