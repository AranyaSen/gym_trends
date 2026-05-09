import { Request, Response, NextFunction } from "express";
import Joi from "joi";
import { Role } from "@prisma/client";
import * as membershipService from "../services/membership.service";
import { fail, ok } from "../utils/response";
import type { AuthedUser } from "../middleware/auth";

const assignSchema = Joi.object({
  memberEmail: Joi.string().email().required(),
  planId: Joi.string().required(),
});

export async function assign(req: Request, res: Response, next: NextFunction) {
  try {
    const u = (req as Request & { user: AuthedUser }).user;
    if (u.role !== Role.ADMIN || !u.gymId) return fail(res, "Forbidden", 403);
    const { error, value } = assignSchema.validate(req.body);
    if (error) return fail(res, error.message, 422);
    const membership = await membershipService.assignPlanToMember({
      gymId: u.gymId,
      adminUserId: u.id,
      memberEmail: value.memberEmail,
      planId: value.planId,
    });
    return ok(res, { membership });
  } catch (e) {
    next(e);
  }
}
