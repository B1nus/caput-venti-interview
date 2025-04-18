import express from "express";
import { db } from "../db";
import { roleValidator } from "../middleware/role";
import { Role } from "../../generated/prisma/client";

export const userRouter = express.Router();

userRouter.post("/unregister", roleValidator(Role.USER), async (req, res, next) => {
  const { id } = res.decoded;
	await db.user.delete({ where: { id } });
	res.status(200).end();
  next();
});

// app.get('/transactions')
