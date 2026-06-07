import { Request, Response, NextFunction } from "express";
import Joi from "joi";
import { Role, User } from "@prisma/client";
import * as authService from "../services/auth.service";
import { success, fail } from "../utils/response";

const registerAdminSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  name: Joi.string().min(1).required(),
  gymName: Joi.string().min(1).required(),
});

const registerJoinSchema = Joi.object({
  joinCode: Joi.string().min(4).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  name: Joi.string().min(1).required(),
  phone: Joi.string().allow("").optional(),
  role: Joi.string().valid("TRAINER", "MEMBER").required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export async function registerAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { error, value } = registerAdminSchema.validate(req.body);
    if (error) return fail(res, error.message, 422);
    const result = await authService.registerAdmin(value);
    return success(res, {
      user: sanitizeUser(result?.user as User),
      gym: result?.gym,
    });
  } catch (e) {
    next(e);
  }
}

export async function registerMember(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { error, value } = registerJoinSchema.validate(req.body);
    if (error) return fail(res, error.message, 422);
    const result = await authService.registerWithJoinCode({
      ...value,
      role: value.role as Role,
    });
    return success(res, {
      user: sanitizeUser(result.user),
      gym: result.gym,
    });
  } catch (e) {
    next(e);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) return fail(res, error.message, 422);
    const out = await authService.login(value);
    const { pendingPlanRequest } = await authService.getUserDetails(
      out.user.id,
      out.user.gymId,
    );
    return success(res, {
      token: out.token,
      user: sanitizeUser(out.user),
      membership: out.membership,
      gym: out.gym
        ? {
            onlinePaymentsEnabled: out.gym.onlinePaymentsEnabled,
            geoFencingEnabled: out.gym.geoFencingEnabled,
          }
        : null,
      pendingPlanRequest,
    });
  } catch (e) {
    next(e);
  }
}

export async function user(req: Request, res: Response, next: NextFunction) {
  try {
    const user = req.user;
    if (user) {
      const { membership, gym, pendingPlanRequest } =
        await authService.getUserDetails(user.id, user.gymId);
      return success(res, {
        user: { id: user.id, role: user.role, gymId: user.gymId },
        membership,
        gym: gym
          ? {
              onlinePaymentsEnabled: gym.onlinePaymentsEnabled,
              geoFencingEnabled: gym.geoFencingEnabled,
            }
          : null,
        pendingPlanRequest,
      });
    }
  } catch (e) {
    next(e);
  }
}

function sanitizeUser(u: {
  id: string;
  email: string;
  name: string;
  role: Role;
  gymId: string | null;
}) {
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role,
    gymId: u.gymId,
  };
}
