import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";

export async function listAuditLogs(input: {
  gymId: string;
  from?: Date;
  to?: Date;
  skip: number;
  take: number;
}) {
  const where: Prisma.AuditLogWhereInput = { gymId: input.gymId };
  if (input.from || input.to) {
    where.createdAt = {};
    if (input.from) where.createdAt.gte = input.from;
    if (input.to) where.createdAt.lte = input.to;
  }
  const [items, total] = await prisma.$transaction([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: input.skip,
      take: input.take,
    }),
    prisma.auditLog.count({ where }),
  ]);
  return { items, total };
}

export async function logAdminAction(input: {
  gymId: string;
  adminUserId: string;
  action: string;
  entityType: string;
  entityId?: string | null;
  metadata?: Record<string, unknown>;
}) {
  return prisma.auditLog.create({
    data: {
      gymId: input.gymId,
      adminUserId: input.adminUserId,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId ?? undefined,
      metadata: (input.metadata ?? undefined) as
        | Prisma.InputJsonValue
        | undefined,
    },
  });
}
