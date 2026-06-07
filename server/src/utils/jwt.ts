import jwt from "jsonwebtoken";
import { env } from "../config/env";

export type TokenPayload = {
  sub: string;
  role: string;
  gymId: string | null;
};

export function signAccessToken(payload: TokenPayload) {
  return jwt.sign(payload, env.accessTokenSecret, {
    expiresIn: env.accessTokenExpiresIn as jwt.SignOptions["expiresIn"],
  });
}

export function signRefreshToken(payload: TokenPayload) {
  return jwt.sign(payload, env.refreshTokenSecret, {
    expiresIn: env.refreshTokenExpiresIn as jwt.SignOptions["expiresIn"],
  });
}

export function verifyAccessToken(access_token: string): TokenPayload {
  return jwt.verify(access_token, env.accessTokenSecret) as TokenPayload;
}

export function verifyRefreshToken(refresh_token: string): TokenPayload {
  return jwt.verify(refresh_token, env.accessTokenSecret) as TokenPayload;
}

export type QrJwtPayload = {
  jti: string;
  gymId: string;
  type: "ENTRY" | "EXIT";
};

export function signQrToken(payload: QrJwtPayload, expiresInSec: number) {
  return jwt.sign(payload, env.accessTokenSecret, { expiresIn: expiresInSec });
}

export function verifyQrToken(token: string): QrJwtPayload {
  return jwt.verify(token, env.accessTokenSecret) as QrJwtPayload;
}
