import { check } from "express-validator";
import { db } from "../db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const loginValidator = async (req, res, next) => {
  const passwordResult = await passwordValidator.run(req);
  const nameResult = await nameValidator.run(req);

  if (!passwordResult.isEmpty() || !nameResult.isEmpty()) {
    return res.status(400).json({ error: "Invalid credentials" });
  }

  const { name, password } = req.body;
  const user = await db.user.findUnique({ where: { name } });

  if (user == null) {
    return res.status(400).json({ error: "Invalid credentials" });
  }

  if (!(await bcrypt.compareSync(password, user.password))) {
    return res.status(400).json({ error: "Invalid credentials" });
  }

  req.user = user;

  next();
};

export const tokenValidator = async (req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(400).json({ error: "Missing authentication token" });
  }

  const auth = req.headers.authorization;
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : auth;

  try {
    const { id } = jwt.verify(token, process.env.JWT_SECRET);
    const user = await db.user.findUnique({ where: { id } });

    if (user) {
      req.user = user;
      next();
    } else {
      return res.status(410).json({ error: "User does not exists" });
    }
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Authentication token expired" });
    } else if (error.name === "NotBeforeError") {
      return res.status(400).json({ error: "Bogus authentication token date" });
    } else {
      return res.status(400).json({ error: "Invalid authentication token" });
    }
  }
};

export const nameValidator = check("name")
  .notEmpty()
  .withMessage("Name must not be empty")
  .trim()
  .escape();

export const passwordValidator = check("password")
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
