import { Gym, Membership, MembershipStatus } from "@prisma/client";

const MS_DAY = 86400000;

export function membershipAllowsAttendance(
  m: Membership | null,
  gym: Pick<Gym, "gracePeriodDays">
): { ok: boolean; reason?: string } {
  if (!m || m.status !== MembershipStatus.ACTIVE) {
    return { ok: false, reason: "No active membership" };
  }
  const now = Date.now();
  const end = m.endDate.getTime();
  if (now <= end) return { ok: true };

  const graceMs = gym.gracePeriodDays * MS_DAY;
  if (graceMs > 0 && now <= end + graceMs) return { ok: true };

  return { ok: false, reason: "Membership expired" };
}
