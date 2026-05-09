import { MembershipStatus, Role } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { logAdminAction } from "./audit.service";

export async function assignPlanToMember(input: {
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
  if (!member) throw new Error("Member not found in this gym");

  const plan = await prisma.plan.findFirst({
    where: { id: input.planId, gymId: input.gymId, isActive: true },
  });
  if (!plan) throw new Error("Plan not found");

  const start = new Date();
  const end = new Date(start.getTime() + plan.durationDays * 86400000);

  const membership = await prisma.$transaction(async (tx) => {
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
        fromPlanId: null,
        toPlanId: plan.id,
        changeType: "ASSIGN",
      },
    });

    return m;
  });

  await logAdminAction({
    gymId: input.gymId,
    adminUserId: input.adminUserId,
    action: "MEMBERSHIP_ASSIGN",
    entityType: "Membership",
    entityId: membership.id,
    metadata: { memberId: member.id, planId: plan.id },
  });

  return membership;
}
