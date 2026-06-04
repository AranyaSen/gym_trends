import { Request, Response, NextFunction } from "express";
import * as userService from "../services/user.service";
import { success, fail } from "../utils/response";
import type { AuthedUser } from "../middleware/auth";

export async function listMembers(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const u = (req as Request & { user: AuthedUser }).user;
    if (!u.gymId) return fail(res, "No gym", 400);
    const skip = Math.min(Number(req.query.skip ?? 0), 100000);
    const take = Math.min(Number(req.query.take ?? 50), 200);
    const q = req.query.q ? String(req.query.q) : undefined;
    const out = await userService.listMembers({
      gymId: u.gymId,
      q,
      skip: Number.isFinite(skip) ? skip : 0,
      take: Number.isFinite(take) ? take : 50,
    });
    return success(res, out);
  } catch (e) {
    next(e);
  }
}
