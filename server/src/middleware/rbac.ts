import { Request, Response, NextFunction } from "express";
import { Role } from "@prisma/client";
import { fail } from "../utils/response";
import type { AuthedUser } from "./auth";

export function requireRoles(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const u = (req as Request & { user?: AuthedUser }).user;
    if (!u) return fail(res, "Unauthorized", 401);
    if (!roles.includes(u.role)) {
      return fail(res, "Forbidden", 403);
    }
    return next();
  };
}
