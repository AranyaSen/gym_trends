import { Request, Response, NextFunction } from "express";
import Joi from "joi";
import * as trainerService from "../services/trainer.service";
import { ok, fail } from "../utils/response";
import type { AuthedUser } from "../middleware/auth";

const linkSchema = Joi.object({
  trainerId: Joi.string().required(),
  memberId: Joi.string().required(),
});

export async function listTrainers(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const u = (req as Request & { user: AuthedUser }).user;
    if (!u.gymId) return fail(res, "No gym", 400);
    const rows = await trainerService.listTrainers(u.gymId);
    return ok(res, { trainers: rows });
  } catch (e) {
    next(e);
  }
}

export async function linkPair(req: Request, res: Response, next: NextFunction) {
  try {
    const u = (req as Request & { user: AuthedUser }).user;
    if (!u.gymId) return fail(res, "No gym", 400);
    const { error, value } = linkSchema.validate(req.body);
    if (error) return fail(res, error.message, 422);
    const out = await trainerService.linkTrainerMember({
      gymId: u.gymId,
      adminUserId: u.id,
      ...value,
    });
    return ok(res, out);
  } catch (e) {
    next(e);
  }
}

export async function unlinkPair(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const u = (req as Request & { user: AuthedUser }).user;
    if (!u.gymId) return fail(res, "No gym", 400);
    const trainerId = req.params.trainerId;
    const memberId = req.params.memberId;
    if (!trainerId || !memberId) return fail(res, "Missing ids", 400);
    const out = await trainerService.unlinkTrainerMember({
      gymId: u.gymId,
      adminUserId: u.id,
      trainerId,
      memberId,
    });
    return ok(res, out);
  } catch (e) {
    next(e);
  }
}

export async function myMembers(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const u = (req as Request & { user: AuthedUser }).user;
    if (!u.gymId) return fail(res, "No gym", 400);
    const rows = await trainerService.listAssignedMembersForTrainer(
      u.gymId,
      u.id
    );
    return ok(res, { members: rows });
  } catch (e) {
    next(e);
  }
}
