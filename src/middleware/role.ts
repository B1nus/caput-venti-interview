import { Role } from "../generated/prisma/client";

export function roleValidator(...roles: Role[]) {
  return (req, res, next) => {
    for (const role of roles) {
      if (req.user.role == role.toString()) {
        return next();
      }
    }
    return res.status(401).json({ error: "Unathorized" });
  };
}
