import { Request, Response, NextFunction } from "express";
import Joi from "joi";
import { Role } from "@prisma/client";
import {
  createRazorpayOrderForMember,
  recordOfflinePayment,
} from "../services/payment.service";
import { ok, fail } from "../utils/response";
import type { AuthedUser } from "../middleware/auth";

const offlineSchema = Joi.object({
  memberEmail: Joi.string().email().required(),
  planId: Joi.string().required(),
  amountCents: Joi.number().integer().min(1).required(),
  note: Joi.string().allow("").optional(),
});

const orderSchema = Joi.object({
  planId: Joi.string().required(),
});

export async function offline(req: Request, res: Response, next: NextFunction) {
  try {
    const u = (req as Request & { user: AuthedUser }).user;
    if (u.role !== Role.ADMIN || !u.gymId) return fail(res, "Forbidden", 403);
    const { error, value } = offlineSchema.validate(req.body);
    if (error) return fail(res, error.message, 422);
    const payment = await recordOfflinePayment({
      gymId: u.gymId,
      adminUserId: u.id,
      ...value,
    });
    return ok(res, { payment });
  } catch (e) {
    next(e);
  }
}

export async function razorpayOrder(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const u = (req as Request & { user: AuthedUser }).user;
    if (u.role !== Role.MEMBER || !u.gymId) {
      return fail(res, "Forbidden", 403);
    }
    const { error, value } = orderSchema.validate(req.body);
    if (error) return fail(res, error.message, 422);
    const out = await createRazorpayOrderForMember({
      gymId: u.gymId,
      userId: u.id,
      planId: value.planId,
    });
    return ok(res, out);
  } catch (e) {
    next(e);
  }
}
