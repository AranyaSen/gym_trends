import { Role } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { csvLine } from "../utils/csv";

const defaultRangeMs = 30 * 86400000;

export function parseExportRange(query: {
  from?: string;
  to?: string;
}): { from: Date; to: Date } {
  const to = query.to ? new Date(query.to) : new Date();
  const from = query.from
    ? new Date(query.from)
    : new Date(to.getTime() - defaultRangeMs);
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
    throw new Error("Invalid date range");
  }
  return { from, to };
}

export async function exportMembersCsv(gymId: string, from: Date, to: Date) {
  const rows = await prisma.user.findMany({
    where: {
      gymId,
      role: Role.MEMBER,
      createdAt: { gte: from, lte: to },
    },
    orderBy: { createdAt: "desc" },
    select: { email: true, name: true, phone: true, createdAt: true },
  });
  let out = csvLine(["email", "name", "phone", "createdAt"]);
  for (const r of rows) {
    out += csvLine([
      r.email,
      r.name,
      r.phone ?? "",
      r.createdAt.toISOString(),
    ]);
  }
  return out;
}

export async function exportAttendanceCsv(
  gymId: string,
  from: Date,
  to: Date
) {
  const rows = await prisma.attendance.findMany({
    where: { gymId, checkInAt: { gte: from, lte: to } },
    orderBy: { checkInAt: "desc" },
    include: { user: { select: { email: true, name: true } } },
  });
  let out = csvLine([
    "checkInAt",
    "checkOutAt",
    "source",
    "memberEmail",
    "memberName",
  ]);
  for (const r of rows) {
    out += csvLine([
      r.checkInAt.toISOString(),
      r.checkOutAt ? r.checkOutAt.toISOString() : "",
      r.source,
      r.user.email,
      r.user.name,
    ]);
  }
  return out;
}

export async function exportTrainersCsv(gymId: string) {
  const rows = await prisma.user.findMany({
    where: { gymId, role: Role.TRAINER },
    orderBy: { name: "asc" },
    select: { email: true, name: true, phone: true, createdAt: true },
  });
  let out = csvLine(["email", "name", "phone", "createdAt"]);
  for (const r of rows) {
    out += csvLine([
      r.email,
      r.name,
      r.phone ?? "",
      r.createdAt.toISOString(),
    ]);
  }
  return out;
}

export async function exportAuditCsv(gymId: string, from: Date, to: Date) {
  const rows = await prisma.auditLog.findMany({
    where: { gymId, createdAt: { gte: from, lte: to } },
    orderBy: { createdAt: "desc" },
  });
  let out = csvLine([
    "createdAt",
    "action",
    "entityType",
    "entityId",
    "adminUserId",
  ]);
  for (const r of rows) {
    out += csvLine([
      r.createdAt.toISOString(),
      r.action,
      r.entityType,
      r.entityId ?? "",
      r.adminUserId,
    ]);
  }
  return out;
}
