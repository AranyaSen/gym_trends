import { Request, Response, NextFunction } from "express";
import Joi from "joi";
import { Role } from "@prisma/client";
import { prisma } from "../lib/prisma";
import * as gymService from "../services/gym.service";
import { ok, fail } from "../utils/response";
import type { AuthedUser } from "../middleware/auth";

const setupSchema = Joi.object({
  name: Joi.string().min(1).required(),
  latitude: Joi.number().required(),
  longitude: Joi.number().required(),
  gracePeriodDays: Joi.number().integer().min(0).required(),
  onlinePaymentsEnabled: Joi.boolean().required(),
});

export async function getMyGym(req: Request, res: Response, next: NextFunction) {
  try {
    const u = (req as Request & { user: AuthedUser }).user;
    if (!u.gymId) return fail(res, "No gym", 400);
    const gym = await prisma.gym.findUnique({ where: { id: u.gymId } });
    if (!gym) return fail(res, "Gym not found", 404);
    return ok(res, { gym });
  } catch (e) {
    next(e);
  }
}

export async function completeSetup(req: Request, res: Response, next: NextFunction) {
  try {
    const u = (req as Request & { user: AuthedUser }).user;
    if (u.role !== Role.ADMIN || !u.gymId) return fail(res, "Forbidden", 403);
    const { error, value } = setupSchema.validate(req.body);
    if (error) return fail(res, error.message, 422);
    const gym = await gymService.updateGymSetup(u.gymId, u.id, value);
    return ok(res, { gym });
  } catch (e) {
    next(e);
  }
}
