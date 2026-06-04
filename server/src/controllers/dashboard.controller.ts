import { Request, Response, NextFunction } from "express";
import * as dashboardService from "../services/dashboard.service";
import { success, fail } from "../utils/response";
import type { AuthedUser } from "../middleware/auth";

export async function getDashboard(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const u = (req as Request & { user: AuthedUser }).user;
    if (!u.gymId) return fail(res, "No gym", 400);
    const stats = await dashboardService.getDashboardStats(u.gymId);
    return success(res, { stats });
  } catch (e) {
    next(e);
  }
}
