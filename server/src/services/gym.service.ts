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

export async function updateGymSettings(
  gymId: string,
  adminUserId: string,
  input: {
    onlinePaymentsEnabled?: boolean;
    geoFencingEnabled?: boolean;
    latitude?: number;
    longitude?: number;
  },
) {
  const data: {
    onlinePaymentsEnabled?: boolean;
    geoFencingEnabled?: boolean;
    latitude?: number;
    longitude?: number;
  } = {};

  if (input.onlinePaymentsEnabled !== undefined) {
    data.onlinePaymentsEnabled = input.onlinePaymentsEnabled;
  }
  if (input.geoFencingEnabled !== undefined) {
    data.geoFencingEnabled = input.geoFencingEnabled;
  }
  if (input.latitude !== undefined) data.latitude = input.latitude;
  if (input.longitude !== undefined) data.longitude = input.longitude;

  const gym = await prisma.gym.update({
    where: { id: gymId },
    data,
  });

  await logAdminAction({
    gymId,
    adminUserId,
    action: "GYM_SETTINGS_UPDATED",
    entityType: "Gym",
    entityId: gymId,
    metadata: { ...data },
  });

  return gym;
}
