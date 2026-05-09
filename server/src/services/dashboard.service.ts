import { MembershipStatus, Role } from "@prisma/client";
import { prisma } from "../lib/prisma";

const DAY_MS = 86400000;

export async function getDashboardStats(gymId: string) {
  const now = new Date();
  const in7 = new Date(now.getTime() + 7 * DAY_MS);
  const ago7 = new Date(now.getTime() - 7 * DAY_MS);
  const ago30 = new Date(now.getTime() - 30 * DAY_MS);

  const totalMembers = await prisma.user.count({
    where: { gymId, role: Role.MEMBER },
  });

  const activeMemberships = await prisma.membership.count({
    where: {
      gymId,
      status: MembershipStatus.ACTIVE,
      endDate: { gte: now },
    },
  });

  const expiringSoon = await prisma.membership.count({
    where: {
      gymId,
      status: MembershipStatus.ACTIVE,
      endDate: { gte: now, lte: in7 },
    },
  });

  const inactiveMembers = await prisma.user.count({
    where: {
      gymId,
      role: Role.MEMBER,
      NOT: {
        attendance: {
          some: { gymId, checkInAt: { gte: ago7 } },
        },
      },
    },
  });

  const peak = await prisma.$queryRaw<Array<{ h: number; c: bigint }>>`
    SELECT (EXTRACT(HOUR FROM "checkInAt"))::int AS h, COUNT(*)::bigint AS c
    FROM "Attendance"
    WHERE "gymId" = ${gymId}
      AND "checkInAt" >= ${ago30}
    GROUP BY EXTRACT(HOUR FROM "checkInAt")
    ORDER BY c DESC
    LIMIT 5
  `;

  return {
    totalMembers,
    activeMembers: activeMemberships,
    expiringMemberships: expiringSoon,
    inactiveMembers,
    peakEntryHours: peak.map((p) => ({
      hour: p.h,
      count: Number(p.c),
    })),
  };
}
