import { AttendanceSource, Role } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { logAdminAction } from "./audit.service";

const DAY_MS = 86400000;

export async function addManualAttendance(input: {
  gymId: string;
  adminUserId: string;
  memberEmail: string;
  checkInAt: Date;
  checkOutAt?: Date | null;
}) {
  const now = new Date();
  const oldest = new Date(now.getTime() - 7 * DAY_MS);
  if (input.checkInAt > now) throw new Error("Check-in cannot be in the future");
  if (input.checkInAt < oldest) {
    throw new Error("Manual attendance only up to past 7 days");
  }
  if (input.checkOutAt) {
    if (input.checkOutAt > now) throw new Error("Check-out cannot be in the future");
    if (input.checkOutAt < input.checkInAt) {
      throw new Error("Check-out must be after check-in");
    }
  }

  const member = await prisma.user.findFirst({
    where: {
      email: input.memberEmail,
      gymId: input.gymId,
      role: Role.MEMBER,
    },
  });
  if (!member) throw new Error("Member not found");

  const row = await prisma.attendance.create({
    data: {
      gymId: input.gymId,
      userId: member.id,
      checkInAt: input.checkInAt,
      checkOutAt: input.checkOutAt ?? undefined,
      source: AttendanceSource.MANUAL_ADMIN,
      manualByUserId: input.adminUserId,
    },
  });

  await logAdminAction({
    gymId: input.gymId,
    adminUserId: input.adminUserId,
    action: "ATTENDANCE_MANUAL",
    entityType: "Attendance",
    entityId: row.id,
    metadata: { memberId: member.id },
  });

  return row;
}
