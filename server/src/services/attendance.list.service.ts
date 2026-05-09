import { prisma } from "../lib/prisma";

export async function listAttendanceRecords(input: {
  gymId: string;
  from: Date;
  to: Date;
  userId?: string;
  skip: number;
  take: number;
}) {
  const where = {
    gymId: input.gymId,
    checkInAt: { gte: input.from, lte: input.to },
    ...(input.userId ? { userId: input.userId } : {}),
  };
  const [items, total] = await prisma.$transaction([
    prisma.attendance.findMany({
      where,
      orderBy: { checkInAt: "desc" },
      skip: input.skip,
      take: input.take,
      include: {
        user: { select: { id: true, email: true, name: true } },
      },
    }),
    prisma.attendance.count({ where }),
  ]);
  return { items, total };
}
