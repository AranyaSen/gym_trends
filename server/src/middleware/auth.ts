import { NextFunction, Request, Response } from "express";
import { Role } from "@prisma/client";
import { verifyAccessToken } from "../utils/jwt";
import { fail } from "../utils/response";

export type AuthedUser = {
  id: string;
  role: Role;
  gymId: string | null;
};

export function authMiddleWare(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];
  if (!authHeader?.startsWith("Bearer ") || !token) {
    return fail(res, "Unauthorized", 401);
  }
  try {
    const decoded = verifyAccessToken(token);
    req.user = {
      id: decoded.sub,
      role: decoded.role as Role,
      gymId: decoded.gymId as string,
    };
    return next();
  } catch {
    return fail(res, "Unauthorized", 401);
  }
}

export function requireGym(req: Request, res: Response, next: NextFunction) {
  const user = req.user;
  if (!user?.gymId) {
    return fail(res, "Gym context required", 400);
  }
  return next();
}
