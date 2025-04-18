import { Role } from "../generated/prisma/client";

export function roleValidator(...roles: Role[]) {
  return (req, res, next) => {
    for (var role of roles) {
      if (res.decoded.role == role.toString()) {
        return next();
      }
    }
    return res.status(401).json({ error: "Unathorized" });
  };
}
