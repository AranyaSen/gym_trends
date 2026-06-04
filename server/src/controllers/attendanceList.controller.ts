import { Request, Response, NextFunction } from "express";
import * as attendanceList from "../services/attendance.list.service";
import * as exportService from "../services/export.service";
import { success, fail } from "../utils/response";
import type { AuthedUser } from "../middleware/auth";

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const u = (req as Request & { user: AuthedUser }).user;
    if (!u.gymId) return fail(res, "No gym", 400);
    const range = exportService.parseExportRange(
      req.query as { from?: string; to?: string },
    );
    const skip = Math.min(Number(req.query.skip ?? 0), 100000);
    const take = Math.min(Number(req.query.take ?? 50), 200);
    const userId = req.query.userId ? String(req.query.userId) : undefined;
    const out = await attendanceList.listAttendanceRecords({
      gymId: u.gymId,
      from: range.from,
      to: range.to,
      userId,
      skip: Number.isFinite(skip) ? skip : 0,
      take: Number.isFinite(take) ? take : 50,
    });
    return success(res, out);
  } catch (e) {
    next(e);
  }
}
