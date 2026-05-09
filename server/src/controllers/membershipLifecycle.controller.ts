import { Request, Response, NextFunction } from "express";
import Joi from "joi";
import { Role } from "@prisma/client";
import * as lifecycle from "../services/membership.lifecycle.service";
import { ok, fail } from "../utils/response";
import type { AuthedUser } from "../middleware/auth";

const renewSchema = Joi.object({
  memberEmail: Joi.string().email().required(),
  planId: Joi.string().required(),
});

const switchSchema = Joi.object({
  memberEmail: Joi.string().email().required(),
  planId: Joi.string().required(),
  changeType: Joi.string().valid("UPGRADE", "DOWNGRADE").required(),
});

export async function renew(req: Request, res: Response, next: NextFunction) {
  try {
    const u = (req as Request & { user: AuthedUser }).user;
    if (u.role !== Role.ADMIN || !u.gymId) return fail(res, "Forbidden", 403);
    const { error, value } = renewSchema.validate(req.body);
    if (error) return fail(res, error.message, 422);
    const m = await lifecycle.renewMembership({
      gymId: u.gymId,
      adminUserId: u.id,
      ...value,
    });
    return ok(res, { membership: m });
  } catch (e) {
    next(e);
  }
}

export async function switchPlan(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const u = (req as Request & { user: AuthedUser }).user;
    if (u.role !== Role.ADMIN || !u.gymId) return fail(res, "Forbidden", 403);
    const { error, value } = switchSchema.validate(req.body);
    if (error) return fail(res, error.message, 422);
    const m = await lifecycle.switchMembership({
      gymId: u.gymId,
      adminUserId: u.id,
      memberEmail: value.memberEmail,
      planId: value.planId,
      changeType: value.changeType,
    });
    return ok(res, { membership: m });
  } catch (e) {
    next(e);
  }
}
