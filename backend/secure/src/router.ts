import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import express from "express";
import { check, header, validationResult } from "express-validator";
import { db } from "./db";

export const router = express.Router();

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
const jwtValidatorChain = header("authorization")
	.notEmpty()
	.withMessage("Missing jwt token")
	.customSanitizer((value) =>
		value.startsWith("Bearer ") ? value.slice(7) : value,
	)
	.custom(async (token, { req }) => {
		if (!token) {
			throw new Error("Missing jwt token");
		}

		var id = null;
		try {
			id = jwt.verify(token, process.env.JWT_SECRET).id;
		} catch (error) {
			if (error.name === "TokenExpiredError") {
				throw new Error("Jwt token has expired");
			}
			throw new Error("Invalid Jwt token");
		}

		if (id != null && (await db.user.findUnique({ where: { id } })) == null) {
			throw new Error("User no longer exists");
		}
	});

router.post(
	"/register",
	[nameValidatorChain, passwordValidatorChain],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(422).send(
				errors
					.array()
					.map((x) => x.msg)
					.join("\n") + "\n",
			);
		}

		const { name, password } = req.body;
		const user = await db.user.findUnique({ where: { name } });

		if (user != null) {
			res.send("Name already taken\n");
		} else {
			const hashed = bcrypt.hashSync(password, 12);
			await db.user.create({ data: { name, password: hashed } });

			res.send(`User ${name} successfully created\n`);
		}
	},
);

router.post(
	"/login",
	[nameValidatorChain, passwordValidatorChain],
	async (req, res) => {
		const errors = validationResult(req);

		if (errors.isEmpty()) {
			const { name, password } = req.body;
			const user = await db.user.findUnique({ where: { name } });

			if (user != null) {
				if (await bcrypt.compareSync(password, user.password)) {
					const jwtToken = jwt.sign(user, process.env.JWT_SECRET, {
						expiresIn: "1h",
					});
					return res.json(jwtToken);
				}
			}
		}

		res.status(422).send("Invalid credentials\n");
	},
);

router.post("/unregister", [jwtValidatorChain], async (req, res) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).send(
			errors
				.array()
				.map((x) => x.msg)
				.join("\n") + "\n",
		);
	}

	const { id, role } = jwt.verify(
		req.headers.authorization,
		process.env.JWT_SECRET,
	);
	await db.user.delete({ where: { id } });
	res.send("Successfully removed user\n");
});

// app.get('/transactions')
