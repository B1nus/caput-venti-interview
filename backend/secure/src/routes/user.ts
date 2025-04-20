import express from "express";
import { db } from "../db";
import { Role } from "../../generated/prisma/client";
import { tokenValidator } from "../middleware/auth";

export const userRouter = express.Router();

userRouter.post("/unregister", tokenValidator, async (req, res, next) => {
  const { id } = req.user;
  await db.user.delete({ where: { id } });
  res.status(200).end();
  next();
});
