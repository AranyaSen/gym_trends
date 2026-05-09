import jwt from "jsonwebtoken";
import { env } from "../config/env";

export type AccessPayload = {
  sub: string;
  role: string;
  gymId: string | null;
};

export function signAccessToken(payload: AccessPayload) {
  return jwt.sign(payload, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn as jwt.SignOptions["expiresIn"],
  });
}

export function verifyAccessToken(token: string): AccessPayload {
  return jwt.verify(token, env.jwtSecret) as AccessPayload;
}

export type QrJwtPayload = {
  jti: string;
  gymId: string;
  type: "ENTRY" | "EXIT";
};

export function signQrToken(payload: QrJwtPayload, expiresInSec: number) {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: expiresInSec });
}

export function verifyQrToken(token: string): QrJwtPayload {
  return jwt.verify(token, env.jwtSecret) as QrJwtPayload;
}
