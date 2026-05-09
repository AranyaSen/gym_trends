import { prisma } from "../lib/prisma";
import { logAdminAction } from "./audit.service";

export async function createPlan(input: {
  gymId: string;
  adminUserId: string;
  name: string;
  priceCents: number;
  durationDays: number;
}) {
  const plan = await prisma.plan.create({
    data: {
      gymId: input.gymId,
      name: input.name,
      priceCents: input.priceCents,
      durationDays: input.durationDays,
    },
  });
  await logAdminAction({
    gymId: input.gymId,
    adminUserId: input.adminUserId,
    action: "PLAN_CREATE",
    entityType: "Plan",
    entityId: plan.id,
    metadata: { name: plan.name },
  });
  return plan;
}

export async function listPlansForGym(gymId: string) {
  return prisma.plan.findMany({
    where: { gymId },
    orderBy: { createdAt: "desc" },
  });
}

export async function deactivatePlan(input: {
  gymId: string;
  adminUserId: string;
  planId: string;
}) {
  const plan = await prisma.plan.updateMany({
    where: { id: input.planId, gymId: input.gymId },
    data: { isActive: false },
  });
  if (plan.count === 0) throw new Error("Plan not found");
  await logAdminAction({
    gymId: input.gymId,
    adminUserId: input.adminUserId,
    action: "PLAN_DEACTIVATE",
    entityType: "Plan",
    entityId: input.planId,
  });
  return { ok: true };
}
