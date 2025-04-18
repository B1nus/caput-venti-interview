import { db } from "../db";
import jwt from "jsonwebtoken";

export const tokenValidator = async (req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(400).json({ error: "Missing authentication token" });
  }

  const auth = req.headers.authorization;
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : auth;

  try {
    const { id, role } = jwt.verify(token, process.env.JWT_SECRET);

    if (await db.user.findUnique({ where: { id } })) {
      res.decoded = { id, role };
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
