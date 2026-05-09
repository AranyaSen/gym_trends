import { Request, Response, NextFunction } from "express";
import * as auditService from "../services/audit.service";
import { ok, fail } from "../utils/response";
import type { AuthedUser } from "../middleware/auth";

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const u = (req as Request & { user: AuthedUser }).user;
    if (!u.gymId) return fail(res, "No gym", 400);
    const skip = Math.min(Number(req.query.skip ?? 0), 100000);
    const take = Math.min(Number(req.query.take ?? 50), 200);
    const from = req.query.from
      ? new Date(String(req.query.from))
      : undefined;
    const to = req.query.to ? new Date(String(req.query.to)) : undefined;
    const out = await auditService.listAuditLogs({
      gymId: u.gymId,
      from,
      to,
      skip: Number.isFinite(skip) ? skip : 0,
      take: Number.isFinite(take) ? take : 50,
    });
    return ok(res, out);
  } catch (e) {
    next(e);
  }
}
