import { NextFunction, Request, Response } from "express";
import {
  handleRazorpayWebhookPayload,
  verifyRazorpaySignature,
} from "../services/payment.service";

export async function razorpayWebhook(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const sig = req.headers["x-razorpay-signature"];
    const raw =
      req.body instanceof Buffer
        ? req.body.toString("utf8")
        : typeof req.body === "string"
          ? req.body
          : JSON.stringify(req.body);
    if (!verifyRazorpaySignature(raw, String(sig ?? ""))) {
      return res.status(400).send("Invalid signature");
    }
    const payload = JSON.parse(raw) as unknown;
    await handleRazorpayWebhookPayload(payload);
    return res.json({ received: true });
  } catch (e) {
    return next(e);
  }
}
