import { Request, Response, NextFunction } from "express";
import Joi from "joi";
import { Role } from "@prisma/client";
import * as planService from "../services/plan.service";
import { fail, success } from "../utils/response";
import type { AuthedUser } from "../middleware/auth";

const createSchema = Joi.object({
  name: Joi.string().min(1).required(),
  priceCents: Joi.number().integer().min(0).required(),
  durationDays: Joi.number().integer().min(1).required(),
});

export async function listPlans(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const user = (req as Request & { user: AuthedUser }).user;
    if (!user.gymId) return fail(res, "No gym", 400);
    const rows = await planService.listPlansForGym(user.gymId);
    return success(res, { plans: rows });
  } catch (e) {
    next(e);
  }
}

export async function createPlan(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const user = (req as Request & { user: AuthedUser }).user;
    if (user.role !== Role.ADMIN || !user.gymId)
      return fail(res, "Forbidden", 403);
    const { error, value } = createSchema.validate(req.body);
    if (error) return fail(res, error.message, 422);
    const plan = await planService.createPlan({
      gymId: user.gymId,
      adminUserId: user.id,
      ...value,
    });
    return success(res, { plan });
  } catch (e) {
    next(e);
  }
}

export async function deactivatePlan(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const u = (req as Request & { user: AuthedUser }).user;
    if (u.role !== Role.ADMIN || !u.gymId) return fail(res, "Forbidden", 403);
    const planId = req.params.id;
    if (!planId) return fail(res, "Missing id", 400);
    await planService.deactivatePlan({
      gymId: u.gymId,
      adminUserId: u.id,
      planId,
    });
    return success(res, { ok: true });
  } catch (e) {
    next(e);
  }
}
