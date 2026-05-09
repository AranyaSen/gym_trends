import { NextFunction, Request, Response } from "express";
import { Role } from "@prisma/client";
import { verifyAccessToken } from "../utils/jwt";
import { fail } from "../utils/response";

export type AuthedUser = {
  id: string;
  role: Role;
  gymId: string | null;
};

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const h = req.headers.authorization;
  if (!h?.startsWith("Bearer ")) {
    return fail(res, "Unauthorized", 401);
  }
  try {
    const p = verifyAccessToken(h.slice(7));
    (req as Request & { user: AuthedUser }).user = {
      id: p.sub,
      role: p.role as Role,
      gymId: p.gymId,
    };
    return next();
  } catch {
    return fail(res, "Unauthorized", 401);
  }
}

export function requireGym(req: Request, res: Response, next: NextFunction) {
  const u = (req as Request & { user?: AuthedUser }).user;
  if (!u?.gymId) {
    return fail(res, "Gym context required", 400);
  }
  return next();
}
