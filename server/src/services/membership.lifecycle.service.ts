import { MembershipStatus, Role } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { logAdminAction } from "./audit.service";

const DAY_MS = 86400000;

export async function renewMembership(input: {
  gymId: string;
  adminUserId: string;
  memberEmail: string;
  planId: string;
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

  const now = new Date();
  const active = await prisma.membership.findFirst({
    where: {
      userId: member.id,
      gymId: input.gymId,
      status: MembershipStatus.ACTIVE,
      endDate: { gte: now },
    },
    orderBy: { endDate: "desc" },
  });
  if (!active) throw new Error("No active membership to renew");

  const base = active.endDate > now ? active.endDate : now;
  const newEnd = new Date(base.getTime() + plan.durationDays * DAY_MS);

  const updated = await prisma.$transaction(async (tx) => {
    const m = await tx.membership.update({
      where: { id: active.id },
      data: { endDate: newEnd, planId: plan.id },
    });
    await tx.membershipHistory.create({
      data: {
        gymId: input.gymId,
        userId: member.id,
        fromPlanId: active.planId,
        toPlanId: plan.id,
        changeType: "RENEW",
      },
    });
    return m;
  });

  await logAdminAction({
    gymId: input.gymId,
    adminUserId: input.adminUserId,
    action: "MEMBERSHIP_RENEW",
    entityType: "Membership",
    entityId: updated.id,
    metadata: { memberId: member.id, planId: plan.id },
  });

  return updated;
}

export async function switchMembership(input: {
  gymId: string;
  adminUserId: string;
  memberEmail: string;
  planId: string;
  changeType: "UPGRADE" | "DOWNGRADE";
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

  const now = new Date();
  const start = new Date();
  const end = new Date(start.getTime() + plan.durationDays * DAY_MS);

  const membership = await prisma.$transaction(async (tx) => {
    const prev = await tx.membership.findFirst({
      where: {
        userId: member.id,
        gymId: input.gymId,
        status: MembershipStatus.ACTIVE,
      },
      orderBy: { endDate: "desc" },
    });

    await tx.membership.updateMany({
      where: {
        userId: member.id,
        gymId: input.gymId,
        status: MembershipStatus.ACTIVE,
      },
      data: { status: MembershipStatus.EXPIRED },
    });

    const m = await tx.membership.create({
      data: {
        gymId: input.gymId,
        userId: member.id,
        planId: plan.id,
        startDate: start,
        endDate: end,
        status: MembershipStatus.ACTIVE,
      },
    });

    await tx.membershipHistory.create({
      data: {
        gymId: input.gymId,
        userId: member.id,
        fromPlanId: prev?.planId ?? null,
        toPlanId: plan.id,
        changeType: input.changeType,
      },
    });

    return m;
  });

  await logAdminAction({
    gymId: input.gymId,
    adminUserId: input.adminUserId,
    action: `MEMBERSHIP_${input.changeType}`,
    entityType: "Membership",
    entityId: membership.id,
    metadata: { memberId: member.id, planId: plan.id },
  });

  return membership;
}
