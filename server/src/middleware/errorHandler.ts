import { NextFunction, Request, Response } from "express";
import { fail } from "../utils/response";

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  const message = err instanceof Error ? err.message : "Server error";
  const status =
    message === "Unauthorized" || message === "Invalid credentials"
      ? 401
      : message.includes("Forbidden")
        ? 403
        : message.includes("Invalid") || message.includes("expired")
          ? 400
          : 500;
  if (status === 500) {
    console.error(err);
  }
  return fail(res, message, status, status === 500 ? "INTERNAL" : "REQUEST");
}
