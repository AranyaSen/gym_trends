import crypto from "crypto";
import Razorpay from "razorpay";
import { PaymentMethod, PaymentStatus, Role } from "@prisma/client";
import { env } from "../config/env";
import { prisma } from "../lib/prisma";
import { logAdminAction } from "./audit.service";
import {
  applyPlanAfterPayment,
  assertPaymentPending,
  markPaymentCompleted,
} from "./payment.core";

export async function recordOfflinePayment(input: {
  gymId: string;
  adminUserId: string;
  memberEmail: string;
  planId: string;
  amountCents: number;
  note?: string;
}) {
  const member = await prisma.user.findFirst({
    where: {
      email: input.memberEmail,
      gymId: input.gymId,
      role: Role.MEMBER,
    },
  });
  if (!member) throw new Error("Member not found");

  const plan = await prisma.plan.findFirst({
    where: { id: input.planId, gymId: input.gymId, isActive: true },
  });
  if (!plan) throw new Error("Plan not found");
  if (plan.priceCents !== input.amountCents) {
    throw new Error("Amount must match plan price");
  }

  const payment = await prisma.payment.create({
    data: {
      gymId: input.gymId,
      userId: member.id,
      planId: plan.id,
      amountCents: input.amountCents,
      method: PaymentMethod.OFFLINE,
      status: PaymentStatus.COMPLETED,
      note: input.note,
    },
  });

  await applyPlanAfterPayment({
    gymId: input.gymId,
    userId: member.id,
    planId: plan.id,
  });

  await logAdminAction({
    gymId: input.gymId,
    adminUserId: input.adminUserId,
    action: "PAYMENT_OFFLINE",
    entityType: "Payment",
    entityId: payment.id,
    metadata: { memberId: member.id, planId: plan.id },
  });

  return payment;
}

export async function createRazorpayOrderForMember(input: {
  gymId: string;
  userId: string;
  planId: string;
}) {
  const gym = await prisma.gym.findUnique({ where: { id: input.gymId } });
  if (!gym?.onlinePaymentsEnabled) {
    throw new Error("Online payments disabled for this gym");
  }
  if (!env.razorpayKeyId || !env.razorpayKeySecret) {
    throw new Error("Razorpay not configured");
  }

  const plan = await prisma.plan.findFirst({
    where: { id: input.planId, gymId: input.gymId, isActive: true },
  });
  if (!plan) throw new Error("Plan not found");

  const rzp = new Razorpay({
    key_id: env.razorpayKeyId,
    key_secret: env.razorpayKeySecret,
  });

  const receipt = `gym_${input.gymId.slice(0, 8)}_${Date.now()}`;
  const order = await rzp.orders.create({
    amount: plan.priceCents,
    currency: "INR",
    receipt,
    notes: {
      gymId: input.gymId,
      userId: input.userId,
      planId: plan.id,
    },
  });

  const payment = await prisma.payment.create({
    data: {
      gymId: input.gymId,
      userId: input.userId,
      planId: plan.id,
      amountCents: plan.priceCents,
      method: PaymentMethod.RAZORPAY,
      status: PaymentStatus.PENDING,
      razorpayOrderId: order.id,
    },
  });

  return {
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    keyId: env.razorpayKeyId,
    paymentId: payment.id,
  };
}

export function verifyRazorpaySignature(body: string, signature: string) {
  if (!env.razorpayWebhookSecret) return false;
  const expected = crypto
    .createHmac("sha256", env.razorpayWebhookSecret)
    .update(body)
    .digest("hex");
  return expected === signature;
}

export async function handleRazorpayWebhookPayload(payload: unknown) {
  const p = payload as {
    event?: string;
    payload?: {
      payment?: { entity?: { order_id?: string; id?: string; amount?: number } };
    };
  };
  const event = p.event;
  const pay = p.payload?.payment?.entity;
  if (!event || !pay?.order_id) return { ok: false as const };

  if (event !== "payment.captured" && event !== "order.paid") {
    return { ok: true as const, ignored: true };
  }

  const orderId = pay.order_id;
  const payment = await prisma.payment.findFirst({
    where: { razorpayOrderId: orderId },
  });
  if (!payment) return { ok: false as const };

  assertPaymentPending(payment);
  if (pay.amount != null && pay.amount !== payment.amountCents) {
    throw new Error("Amount mismatch");
  }

  if (!payment.planId) throw new Error("Payment missing plan");

  await markPaymentCompleted({
    paymentId: payment.id,
    razorpayPaymentId: pay.id,
  });

  await applyPlanAfterPayment({
    gymId: payment.gymId,
    userId: payment.userId,
    planId: payment.planId,
  });

  return { ok: true as const, processed: true };
}
