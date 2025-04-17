import bcrypt from "bcrypt";
import express from "express";
import { check, validationResult } from "express-validator";
import { db } from "./db";

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
const validatorChain = [nameValidatorChain, passwordValidatorChain];

export const router = express.Router();

router.post("/register", validatorChain, async (req, res) => {
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
});

router.post("/login", validatorChain, async (req, res) => {
	const errors = validationResult(req);

  if (errors.isEmpty()) {
    const { name, password } = req.body;
    const user = await db.user.findUnique({ where: { name } });

    if (user != null) {
      if (await bcrypt.compareSync(password, user.password)) {
        return res.send(`Successfully logged in to user ${name}\n`);
      }
    }
  }

  res.send("Invalid credentials\n");
});

// app.post('/unregister', []

// app.get('/transactions')
