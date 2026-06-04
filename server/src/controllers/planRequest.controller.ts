import { Request, Response, NextFunction } from "express";
import Joi from "joi";
import { Role } from "@prisma/client";
import * as planRequestService from "../services/planRequest.service";
import { success, fail } from "../utils/response";
import type { AuthedUser } from "../middleware/auth";

const requestSchema = Joi.object({
  planId: Joi.string().required(),
});

export async function createRequest(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const u = (req as Request & { user: AuthedUser }).user;
    if (u.role !== Role.MEMBER || !u.gymId) return fail(res, "Forbidden", 403);
    const { error, value } = requestSchema.validate(req.body);
    if (error) return fail(res, error.message, 422);

    const request = await planRequestService.createPlanRequest({
      gymId: u.gymId,
      userId: u.id,
      planId: value.planId,
    });
    return success(res, { request });
  } catch (e) {
    next(e);
  }
}

export async function listRequests(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const u = (req as Request & { user: AuthedUser }).user;
    if (u.role !== Role.ADMIN || !u.gymId) return fail(res, "Forbidden", 403);

    const requests = await planRequestService.listPlanRequests({
      gymId: u.gymId,
    });
    return success(res, { requests });
  } catch (e) {
    next(e);
  }
}

export async function approveRequest(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const u = (req as Request & { user: AuthedUser }).user;
    if (u.role !== Role.ADMIN || !u.gymId) return fail(res, "Forbidden", 403);

    const requestId = req.params.id;
    const out = await planRequestService.approvePlanRequest({
      gymId: u.gymId,
      requestId,
      adminUserId: u.id,
    });
    return success(res, out);
  } catch (e) {
    next(e);
  }
}

export async function rejectRequest(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const u = (req as Request & { user: AuthedUser }).user;
    if (u.role !== Role.ADMIN || !u.gymId) return fail(res, "Forbidden", 403);

    const requestId = req.params.id;
    const request = await planRequestService.rejectPlanRequest({
      gymId: u.gymId,
      requestId,
      adminUserId: u.id,
    });
    return success(res, { request });
  } catch (e) {
    next(e);
  }
}
