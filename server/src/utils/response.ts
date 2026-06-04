import { Response } from "express";

export function success<T>(res: Response, data: T, status = 200) {
  return res.status(status).json({ data, error: null });
}

export function fail(
  res: Response,
  message: string,
  status = 400,
  code?: string,
) {
  return res.status(status).json({ data: null, error: { message, code } });
}
