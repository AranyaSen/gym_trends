import { Request, Response, NextFunction } from "express";
import Joi from "joi";
import { QrType } from "@prisma/client";
import * as qrService from "../services/qr.service";
import { ok, fail } from "../utils/response";
import type { AuthedUser } from "../middleware/auth";

const bodySchema = Joi.object({
  type: Joi.string().valid("ENTRY").required(),
});

export async function mintQr(req: Request, res: Response, next: NextFunction) {
  try {
    const u = (req as Request & { user: AuthedUser }).user;
    if (u.role !== "ADMIN" || !u.gymId) return fail(res, "Forbidden", 403);
    const { error, value } = bodySchema.validate(req.body);
    if (error) return fail(res, error.message, 422);
    const out = await qrService.createQrForGym(u.gymId, QrType.ENTRY);
    return ok(res, out);
  } catch (e) {
    next(e);
  }
}
