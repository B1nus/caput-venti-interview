import jwt from "jsonwebtoken"; // might be better to have this dependency elsewhere.
import bcrypt from "bcrypt";
import express from "express";
import { check, header, validationResult } from "express-validator";
import { db } from "../db";

export const authRouter = express.Router();

const nameValidatorChain = check("name")
	.notEmpty()
	.withMessage("Name must not be empty")
	.trim()
	.escape();
const passwordValidatorChain = check("password")
	.notEmpty()
	.withMessage("Password must not be empty")
	.isLength({ min: 8 })
	.withMessage("Password must be at least 8 characters")
	.matches("[0-9]")
	.withMessage("Password must contain a number")
	.matches("[A-Z]")
	.withMessage("Password must contain an uppercase letter")
	.trim()
	.escape();

authRouter.post(
	"/register",
	nameValidatorChain,
  passwordValidatorChain,
	async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ error: errors.array().map(x => x.msg) });
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

authRouter.post(
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
