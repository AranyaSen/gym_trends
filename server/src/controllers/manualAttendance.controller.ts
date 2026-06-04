import { Request, Response, NextFunction } from "express";
import Joi from "joi";
import * as manualAttendanceService from "../services/manualAttendance.service";
import { success, fail } from "../utils/response";
import type { AuthedUser } from "../middleware/auth";

const bodySchema = Joi.object({
  memberEmail: Joi.string().email().required(),
  checkInAt: Joi.date().iso().required(),
  checkOutAt: Joi.date().iso().optional().allow(null),
});

export async function createManual(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const u = (req as Request & { user: AuthedUser }).user;
    if (!u.gymId) return fail(res, "No gym", 400);
    const { error, value } = bodySchema.validate(req.body);
    if (error) return fail(res, error.message, 422);
    const row = await manualAttendanceService.addManualAttendance({
      gymId: u.gymId,
      adminUserId: u.id,
      memberEmail: value.memberEmail,
      checkInAt: new Date(value.checkInAt),
      checkOutAt: value.checkOutAt ? new Date(value.checkOutAt) : undefined,
    });
    return success(res, { attendance: row });
  } catch (e) {
    next(e);
  }
}
