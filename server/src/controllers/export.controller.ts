import { Request, Response, NextFunction } from "express";
import * as exportService from "../services/export.service";
import { fail } from "../utils/response";
import type { AuthedUser } from "../middleware/auth";

function attachCsv(
  res: Response,
  filename: string,
  body: string
) {
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  return res.status(200).send(body);
}

export async function members(req: Request, res: Response, next: NextFunction) {
  try {
    const u = (req as Request & { user: AuthedUser }).user;
    if (!u.gymId) return fail(res, "No gym", 400);
    const range = exportService.parseExportRange(
      req.query as { from?: string; to?: string }
    );
    const csv = await exportService.exportMembersCsv(u.gymId, range.from, range.to);
    return attachCsv(res, "members.csv", csv);
  } catch (e) {
    next(e);
  }
}

export async function attendance(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const u = (req as Request & { user: AuthedUser }).user;
    if (!u.gymId) return fail(res, "No gym", 400);
    const range = exportService.parseExportRange(
      req.query as { from?: string; to?: string }
    );
    const csv = await exportService.exportAttendanceCsv(
      u.gymId,
      range.from,
      range.to
    );
    return attachCsv(res, "attendance.csv", csv);
  } catch (e) {
    next(e);
  }
}

export async function trainers(req: Request, res: Response, next: NextFunction) {
  try {
    const u = (req as Request & { user: AuthedUser }).user;
    if (!u.gymId) return fail(res, "No gym", 400);
    const csv = await exportService.exportTrainersCsv(u.gymId);
    return attachCsv(res, "trainers.csv", csv);
  } catch (e) {
    next(e);
  }
}

export async function audit(req: Request, res: Response, next: NextFunction) {
  try {
    const u = (req as Request & { user: AuthedUser }).user;
    if (!u.gymId) return fail(res, "No gym", 400);
    const range = exportService.parseExportRange(
      req.query as { from?: string; to?: string }
    );
    const csv = await exportService.exportAuditCsv(u.gymId, range.from, range.to);
    return attachCsv(res, "audit.csv", csv);
  } catch (e) {
    next(e);
  }
}
