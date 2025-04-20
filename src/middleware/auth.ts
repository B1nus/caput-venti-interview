import { check } from "express-validator";
import { db } from "../db";
import { checkPassword, verifyJwtToken } from "../crypto";

export const decryptionValidator = async (req, res, next) => {
  const passwordResult = await passwordValidator("password").run(req);

  if (!passwordResult.isEmpty()) {
    return res.status(400).json({ error: "Invalid credentials" });
  }

  const user = req.user;
  const { password } = req.body;

  if (!checkPassword(password, user.password)) {
    return res.status(400).json({ error: "Invalid credentials" });
  }

  next();
};

export const loginValidator = async (req, res, next) => {
  const passwordResult = await passwordValidator("password").run(req);
  const nameResult = await nameValidator("name").run(req);

  if (!passwordResult.isEmpty() || !nameResult.isEmpty()) {
    return res.status(400).json({ error: "Invalid credentials" });
  }

  const { name, password } = req.body;
  const user = await db.user.findUnique({ where: { name } });

  if (user == null) {
    return res.status(400).json({ error: "Invalid credentials" });
  }

  if (!checkPassword(password, user.password)) {
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
    const { id } = verifyJwtToken(token);
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

export function nameValidator(field: string) {
  return check(field)
    .isString()
    .notEmpty()
    .withMessage("Name cannot be empty")
    .trim()
    .escape();
}

export function passwordValidator(field: string) {
  return check(field)
    .notEmpty()
    .withMessage(`${field} must not be empty`)
    .isLength({ min: 8 })
    .withMessage(`${field} must be at least 8 characters`)
    .matches("[0-9]")
    .withMessage(`${field} password must contain a number`)
    .matches("[A-Z]")
    .withMessage(`${field} password must contain an uppercase letter`)
    .trim()
    .escape();
}
