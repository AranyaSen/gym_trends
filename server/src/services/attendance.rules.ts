const MIN_GAP_MS = 60 * 60 * 1000;
const DUP_MS = 2 * 60 * 1000;
const AUTO_MS = 60 * 60 * 1000;

export function effectiveSessionEnd(checkIn: Date, checkOut: Date | null): Date {
  if (checkOut) return checkOut;
  return new Date(checkIn.getTime() + AUTO_MS);
}

export function canStartNewSession(
  now: Date,
  lastSessionEnd: Date | null
): { ok: boolean } {
  if (!lastSessionEnd) return { ok: true };
  if (now.getTime() < lastSessionEnd.getTime() + MIN_GAP_MS) return { ok: false };
  return { ok: true };
}

export function isDuplicateScan(now: Date, lastEventAt: Date | null): boolean {
  if (!lastEventAt) return false;
  return now.getTime() - lastEventAt.getTime() < DUP_MS;
}

export { MIN_GAP_MS, DUP_MS, AUTO_MS };
