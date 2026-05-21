import { Request, Response, NextFunction } from "express";
import Joi from "joi";
import { Role } from "@prisma/client";
import * as attendanceService from "../services/attendance.service";
import { ok, fail } from "../utils/response";
import type { AuthedUser } from "../middleware/auth";

const scanSchema = Joi.object({
  token: Joi.string().required(),
  latitude: Joi.number().optional(),
  longitude: Joi.number().optional(),
});

export async function scan(req: Request, res: Response, next: NextFunction) {
  try {
    const u = (req as Request & { user: AuthedUser }).user;
    if (u.role !== Role.MEMBER && u.role !== Role.TRAINER) {
      return fail(res, "Forbidden", 403);
    }
    const { error, value } = scanSchema.validate(req.body);
    if (error) return fail(res, error.message, 422);
    const out = await attendanceService.scanQr({
      token: value.token,
      userId: u.id,
      role: u.role,
      latitude: value.latitude,
      longitude: value.longitude,
    });
    return ok(res, out);
  } catch (e) {
    next(e);
  }
}
