import { Role } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { logAdminAction } from "./audit.service";

export async function listTrainers(gymId: string) {
  return prisma.user.findMany({
    where: { gymId, role: Role.TRAINER },
    select: { id: true, email: true, name: true, phone: true, createdAt: true },
    orderBy: { name: "asc" },
  });
}

export async function linkTrainerMember(input: {
  gymId: string;
  adminUserId: string;
  trainerId: string;
  memberId: string;
}) {
  const trainer = await prisma.user.findFirst({
    where: { id: input.trainerId, gymId: input.gymId, role: Role.TRAINER },
  });
  const member = await prisma.user.findFirst({
    where: { id: input.memberId, gymId: input.gymId, role: Role.MEMBER },
  });
  if (!trainer || !member) throw new Error("Trainer or member not found");

  await prisma.trainerMember.upsert({
    where: {
      trainerId_memberId: { trainerId: input.trainerId, memberId: input.memberId },
    },
    create: {
      gymId: input.gymId,
      trainerId: input.trainerId,
      memberId: input.memberId,
    },
    update: {},
  });

  await logAdminAction({
    gymId: input.gymId,
    adminUserId: input.adminUserId,
    action: "TRAINER_LINK",
    entityType: "TrainerMember",
    entityId: `${input.trainerId}:${input.memberId}`,
    metadata: { trainerId: input.trainerId, memberId: input.memberId },
  });

  return { ok: true };
}

export async function unlinkTrainerMember(input: {
  gymId: string;
  adminUserId: string;
  trainerId: string;
  memberId: string;
}) {
  await prisma.trainerMember.deleteMany({
    where: {
      gymId: input.gymId,
      trainerId: input.trainerId,
      memberId: input.memberId,
    },
  });

  await logAdminAction({
    gymId: input.gymId,
    adminUserId: input.adminUserId,
    action: "TRAINER_UNLINK",
    entityType: "TrainerMember",
    entityId: `${input.trainerId}:${input.memberId}`,
    metadata: { trainerId: input.trainerId, memberId: input.memberId },
  });

  return { ok: true };
}

export async function listAssignedMembersForTrainer(
  gymId: string,
  trainerId: string
) {
  const links = await prisma.trainerMember.findMany({
    where: { gymId, trainerId },
    include: {
      member: {
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          memberships: {
            where: { gymId, status: "ACTIVE" },
            take: 1,
            orderBy: { endDate: "desc" },
            include: { plan: true },
          },
        },
      },
    },
  });
  return links.map((l) => l.member);
}
