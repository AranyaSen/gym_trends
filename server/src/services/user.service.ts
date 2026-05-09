import { Role } from "@prisma/client";
import { prisma } from "../lib/prisma";

export async function listMembers(input: {
  gymId: string;
  q?: string;
  skip: number;
  take: number;
}) {
  const where = {
    gymId: input.gymId,
    role: Role.MEMBER,
    ...(input.q
      ? {
          OR: [
            { email: { contains: input.q, mode: "insensitive" as const } },
            { name: { contains: input.q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };
  const [items, total] = await prisma.$transaction([
    prisma.user.findMany({
      where,
      skip: input.skip,
      take: input.take,
      orderBy: { name: "asc" },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        createdAt: true,
        memberships: {
          where: { gymId: input.gymId, status: "ACTIVE" },
          take: 1,
          orderBy: { endDate: "desc" },
          include: { plan: true },
        },
      },
    }),
    prisma.user.count({ where }),
  ]);
  return { items, total };
}
