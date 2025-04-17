import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import express from "express";
import { check, header, validationResult } from "express-validator";
import { db } from "./db";
import { tokenValidator } from "./tokenValidator";

export const router = express.Router();
export const userRouter = express.Router();

const nameValidatorChain = check("name")
	.notEmpty()
	.withMessage("Name must not be empty")
	.trim()
	.escape();
const passwordValidatorChain = check("password")
	.isLength({ min: 8 })
	.withMessage("Password Must Be at Least 8 Characters")
	.matches("[0-9]")
	.withMessage("Password Must Contain a Number")
	.matches("[A-Z]")
	.withMessage("Password Must Contain an Uppercase Letter")
	.trim()
	.escape();

router.post(
	"/register",
	nameValidatorChain,
  passwordValidatorChain,
	async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array });
      return next();
    }

		const { name, password } = req.body;
		const user = await db.user.findUnique({ where: { name } });

		if (user != null) {
			res.status(400).json({ error: "Name already taken" });
		} else {
			const hashed = bcrypt.hashSync(password, 12);
			await db.user.create({ data: { name, password: hashed } });

			res.status(200).end();
		}
    next();
	},
);

router.post(
	"/login",
	nameValidatorChain,
  passwordValidatorChain,
	async (req, res, next) => {
		const errors = validationResult(req);

		if (errors.isEmpty()) {
			const { name, password } = req.body;
			const user = await db.user.findUnique({ where: { name } });

			if (user != null) {
				if (await bcrypt.compareSync(password, user.password)) {
					const jwtToken = jwt.sign(user, process.env.JWT_SECRET, {
						expiresIn: process.env.JWT_EXPIRATION_TIME,
					});
					res.status(200).json({
            token: jwtToken,
          });
          return next();
				}
			}
		}

		res.status(400).json({ error: "Invalid credentials" });
    next();
	},
);

userRouter.post("/unregister", tokenValidator, async (req, res, next) => {
  const { id } = res.decoded;
	await db.user.delete({ where: { id } });
	res.status(200).end();
  next();
});

// app.get('/transactions')
