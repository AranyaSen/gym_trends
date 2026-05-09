import { prisma } from "../lib/prisma";
import { logAdminAction } from "./audit.service";

export async function updateGymSetup(
  gymId: string,
  adminUserId: string,
  input: {
    name: string;
    latitude: number;
    longitude: number;
    gracePeriodDays: number;
    onlinePaymentsEnabled: boolean;
  }
) {
  const gym = await prisma.gym.update({
    where: { id: gymId },
    data: {
      name: input.name,
      latitude: input.latitude,
      longitude: input.longitude,
      gracePeriodDays: input.gracePeriodDays,
      onlinePaymentsEnabled: input.onlinePaymentsEnabled,
      setupCompleted: true,
    },
  });

  await logAdminAction({
    gymId,
    adminUserId,
    action: "GYM_SETUP_COMPLETE",
    entityType: "Gym",
    entityId: gymId,
    metadata: { name: input.name },
  });

  return gym;
}

export async function getGymById(gymId: string) {
  return prisma.gym.findUnique({ where: { id: gymId } });
}
