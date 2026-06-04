import { Request, Response, NextFunction } from "express";
import Joi from "joi";
import { Role } from "@prisma/client";
import { prisma } from "../lib/prisma";
import * as gymService from "../services/gym.service";
import { success, fail } from "../utils/response";
import type { AuthedUser } from "../middleware/auth";

const setupSchema = Joi.object({
  name: Joi.string().min(1).required(),
  latitude: Joi.number().required(),
  longitude: Joi.number().required(),
  gracePeriodDays: Joi.number().integer().min(0).required(),
  onlinePaymentsEnabled: Joi.boolean().required(),
});

const settingsSchema = Joi.object({
  onlinePaymentsEnabled: Joi.boolean(),
  geoFencingEnabled: Joi.boolean(),
  latitude: Joi.number().min(-90).max(90),
  longitude: Joi.number().min(-180).max(180),
})
  .min(1)
  .custom((value, helpers) => {
    const hasLat = value.latitude !== undefined;
    const hasLng = value.longitude !== undefined;
    if (hasLat !== hasLng) {
      return helpers.error("any.custom", {
        message: "latitude and longitude must be provided together",
      });
    }
    if (hasLat && (value.latitude === 0 || value.longitude === 0)) {
      return helpers.error("any.custom", {
        message: "Invalid gym coordinates",
      });
    }
    return value;
  });

export async function getMyGym(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const u = (req as Request & { user: AuthedUser }).user;
    if (!u.gymId) return fail(res, "No gym", 400);
    const gym = await prisma.gym.findUnique({ where: { id: u.gymId } });
    if (!gym) return fail(res, "Gym not found", 404);
    return success(res, { gym });
  } catch (e) {
    next(e);
  }
}

export async function completeSetup(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const u = (req as Request & { user: AuthedUser }).user;
    if (u.role !== Role.ADMIN || !u.gymId) return fail(res, "Forbidden", 403);
    const { error, value } = setupSchema.validate(req.body);
    if (error) return fail(res, error.message, 422);
    const gym = await gymService.updateGymSetup(u.gymId, u.id, value);
    return success(res, { gym });
  } catch (e) {
    next(e);
  }
}

export async function updateSettings(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const u = (req as Request & { user: AuthedUser }).user;
    if (u.role !== Role.ADMIN || !u.gymId) return fail(res, "Forbidden", 403);
    const { error, value } = settingsSchema.validate(req.body);
    if (error) return fail(res, error.message, 422);
    const gym = await gymService.updateGymSettings(u.gymId, u.id, value);
    return success(res, { gym });
  } catch (e) {
    next(e);
  }
}
