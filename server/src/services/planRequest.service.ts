import { Prisma, RequestStatus, Role } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { applyPlanAfterPayment } from "./payment.core";
import { logAdminAction } from "./audit.service";
import { PaymentMethod, PaymentStatus } from "@prisma/client";

export async function createPlanRequest(input: {
  gymId: string;
  userId: string;
  planId: string;
}) {
  const existingPending = await prisma.planRequest.findFirst({
    where: { gymId: input.gymId, userId: input.userId, status: RequestStatus.PENDING },
  });
  if (existingPending) {
    throw new Error("You already have a pending plan request.");
  }

  const plan = await prisma.plan.findFirst({
    where: { id: input.planId, gymId: input.gymId, isActive: true },
  });
  if (!plan) throw new Error("Plan not found");

  const request = await prisma.planRequest.create({
    data: {
      gymId: input.gymId,
      userId: input.userId,
      planId: plan.id,
      status: RequestStatus.PENDING,
    },
    include: {
      plan: true,
    },
  });

  return request;
}

export async function listPlanRequests(input: { gymId: string }) {
  const requests = await prisma.planRequest.findMany({
    where: { gymId: input.gymId, status: RequestStatus.PENDING },
    include: {
      user: { select: { id: true, name: true, email: true, phone: true } },
      plan: { select: { id: true, name: true, priceCents: true, durationDays: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  return requests;
}

export async function approvePlanRequest(input: {
  gymId: string;
  requestId: string;
  adminUserId: string;
}) {
  const request = await prisma.planRequest.findFirst({
    where: { id: input.requestId, gymId: input.gymId, status: RequestStatus.PENDING },
    include: { plan: true },
  });
  if (!request) throw new Error("Pending plan request not found");

  const payment = await prisma.payment.create({
    data: {
      gymId: input.gymId,
      userId: request.userId,
      planId: request.planId,
      amountCents: request.plan.priceCents,
      method: PaymentMethod.OFFLINE,
      status: PaymentStatus.COMPLETED,
      note: "Approved via Plan Request",
    },
  });

  await prisma.planRequest.update({
    where: { id: request.id },
    data: { status: RequestStatus.APPROVED },
  });

  await applyPlanAfterPayment({
    gymId: input.gymId,
    userId: request.userId,
    planId: request.planId,
  });

  await logAdminAction({
    gymId: input.gymId,
    adminUserId: input.adminUserId,
    action: "APPROVE_PLAN_REQUEST",
    entityType: "PlanRequest",
    entityId: request.id,
    metadata: { memberId: request.userId, planId: request.planId },
  });

  return { request, payment };
}

export async function rejectPlanRequest(input: {
  gymId: string;
  requestId: string;
  adminUserId: string;
}) {
  const request = await prisma.planRequest.findFirst({
    where: { id: input.requestId, gymId: input.gymId, status: RequestStatus.PENDING },
  });
  if (!request) throw new Error("Pending plan request not found");

  const updatedRequest = await prisma.planRequest.update({
    where: { id: request.id },
    data: { status: RequestStatus.REJECTED },
  });

  await logAdminAction({
    gymId: input.gymId,
    adminUserId: input.adminUserId,
    action: "REJECT_PLAN_REQUEST",
    entityType: "PlanRequest",
    entityId: request.id,
    metadata: { memberId: request.userId, planId: request.planId },
  });

  return updatedRequest;
}
