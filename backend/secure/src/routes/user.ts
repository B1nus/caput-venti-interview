import { tokenValidator } from "../middleware/jwt";
import express from "express";
import { db } from "../db";

export const userRouter = express.Router();

userRouter.post("/unregister", tokenValidator, async (req, res, next) => {
  const { id } = res.decoded;
	await db.user.delete({ where: { id } });
	res.status(200).end();
  next();
});

// app.get('/transactions')
