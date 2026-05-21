import { AttendanceSource, QrType, Role } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { env } from "../config/env";
import { distanceMeters } from "../utils/geo";
import { verifyQrToken } from "../utils/jwt";
import { membershipAllowsAttendance } from "./membership.util";
import { AUTO_MS, isDuplicateScan } from "./attendance.rules";

async function backfillStaleCheckouts(userId: string, gymId: string, now: Date) {
  const cutoff = new Date(now.getTime() - AUTO_MS);
  const rows = await prisma.attendance.findMany({
    where: {
      userId,
      gymId,
      checkOutAt: null,
      checkInAt: { lt: cutoff },
    },
  });
  for (const row of rows) {
    await prisma.attendance.update({
      where: { id: row.id },
      data: { checkOutAt: new Date(row.checkInAt.getTime() + AUTO_MS) },
    });
  }
}

function lastActivity(a: { checkInAt: Date; checkOutAt: Date | null }) {
  if (a.checkOutAt && a.checkOutAt > a.checkInAt) return a.checkOutAt;
  return a.checkInAt;
}

export async function scanQr(input: {
  token: string;
  userId: string;
  role: Role;
  latitude?: number;
  longitude?: number;
}) {
  if (input.role !== Role.MEMBER && input.role !== Role.TRAINER) {
    throw new Error("Only members and trainers can scan attendance");
  }

  const payload = verifyQrToken(input.token);
  const qr = await prisma.qrToken.findUnique({ where: { id: payload.jti } });
  if (!qr || qr.gymId !== payload.gymId) throw new Error("Invalid QR");

  if (qr.expiresAt.getTime() < Date.now()) throw new Error("QR expired, re scan QR");
  if (qr.type !== QrType.ENTRY) throw new Error("Invalid QR");

  const gym = await prisma.gym.findUnique({ where: { id: qr.gymId } });
  if (!gym) throw new Error("Gym not found");

  if (gym.geoFencingEnabled) {
    if (input.latitude == null || input.longitude == null) {
      throw new Error("Location is required for check-in");
    }
    const dist = distanceMeters(
      input.latitude,
      input.longitude,
      gym.latitude,
      gym.longitude,
    );
    if (dist > env.geoRadiusMeters) {
      throw new Error("Please be inside the gym");
    }
  }

  const user = await prisma.user.findFirst({
    where: { id: input.userId, gymId: gym.id },
  });
  if (!user) throw new Error("User not in gym");

  const membership = await prisma.membership.findFirst({
    where: { userId: input.userId, gymId: gym.id, status: "ACTIVE" },
    orderBy: { endDate: "desc" },
  });

  const gate = membershipAllowsAttendance(membership, gym);
  if (!gate.ok) throw new Error(gate.reason ?? "Membership expired");

  const now = new Date();
  await backfillStaleCheckouts(input.userId, gym.id, now);

  const recent = await prisma.attendance.findMany({
    where: { userId: input.userId, gymId: gym.id },
    orderBy: { checkInAt: "desc" },
    take: 5,
  });

  const lastAny = recent[0];
  if (lastAny && isDuplicateScan(now, lastActivity(lastAny))) {
    return { ignored: true, message: "Duplicate scan ignored" };
  }

  const open = await prisma.attendance.findFirst({
    where: {
      userId: input.userId,
      gymId: gym.id,
      checkOutAt: null,
      checkInAt: { gte: new Date(now.getTime() - AUTO_MS) },
    },
    orderBy: { checkInAt: "desc" },
  });
  if (open) {
    if (isDuplicateScan(now, open.checkInAt)) {
      return { ignored: true, message: "Duplicate scan ignored" };
    }
    throw new Error("Already checked in");
  }

  await prisma.attendance.create({
    data: {
      gymId: gym.id,
      userId: input.userId,
      checkInAt: now,
      source: AttendanceSource.QR,
    },
  });

  return { ignored: false, type: "ENTRY" as const };
}
