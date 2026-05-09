import { MembershipStatus, PaymentMethod, PaymentStatus } from "@prisma/client";
import { prisma } from "../lib/prisma";

const DAY_MS = 86400000;

/** Apply a paid plan: extend active membership or create a new one. */
export async function applyPlanAfterPayment(input: {
  gymId: string;
  userId: string;
  planId: string;
}) {
  const plan = await prisma.plan.findFirst({
    where: { id: input.planId, gymId: input.gymId, isActive: true },
  });
  if (!plan) throw new Error("Plan not found");

  const now = new Date();
  const addMs = plan.durationDays * DAY_MS;
  const active = await prisma.membership.findFirst({
    where: {
      userId: input.userId,
      gymId: input.gymId,
      status: MembershipStatus.ACTIVE,
      endDate: { gte: now },
    },
    orderBy: { endDate: "desc" },
  });

  if (!active) {
    return prisma.membership.create({
      data: {
        gymId: input.gymId,
        userId: input.userId,
        planId: plan.id,
        startDate: now,
        endDate: new Date(now.getTime() + addMs),
        status: MembershipStatus.ACTIVE,
      },
    });
  }

  const base = active.endDate > now ? active.endDate : now;
  return prisma.membership.update({
    where: { id: active.id },
    data: {
      endDate: new Date(base.getTime() + addMs),
      planId: plan.id,
    },
  });
}

export async function markPaymentCompleted(input: {
  paymentId: string;
  razorpayPaymentId?: string;
}) {
  return prisma.payment.update({
    where: { id: input.paymentId },
    data: {
      status: PaymentStatus.COMPLETED,
      razorpayPaymentId: input.razorpayPaymentId,
    },
  });
}

export function assertPaymentPending(p: {
  status: PaymentStatus;
  method: PaymentMethod;
}) {
  if (p.status !== PaymentStatus.PENDING) {
    throw new Error("Payment already processed");
  }
}
