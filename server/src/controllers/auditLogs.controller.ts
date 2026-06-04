import { Request, Response, NextFunction } from "express";
import * as auditService from "../services/audit.service";
import { success, fail } from "../utils/response";
import type { AuthedUser } from "../middleware/auth";
import { paginateResponse } from "../utils/paginate";

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const user = (req as Request & { user: AuthedUser }).user;
    if (!user.gymId) return fail(res, "No gym", 400);
    const page = Number(req.query.page ?? 1);
    const itemsPerPage = Number(req.query.itemsPerPage ?? 10);
    const from = req.query.from ? new Date(String(req.query.from)) : undefined;
    const to = req.query.to ? new Date(String(req.query.to)) : undefined;
    const logs = await auditService.listAuditLogs({
      gymId: user.gymId,
      from,
      to,
      skip: (page - 1) * itemsPerPage,
      take: itemsPerPage,
    });
    const paginatedData = paginateResponse({
      items: logs.items,
      total: logs.total,
      page,
      itemsPerPage,
    });
    return success(res, paginatedData);
  } catch (e) {
    next(e);
  }
}
