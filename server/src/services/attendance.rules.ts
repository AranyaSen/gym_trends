const DUP_MS = 2 * 60 * 1000;
const AUTO_MS = 2 * 60 * 60 * 1000;

export function effectiveSessionEnd(checkIn: Date, checkOut: Date | null): Date {
  if (checkOut) return checkOut;
  return new Date(checkIn.getTime() + AUTO_MS);
}

export function isDuplicateScan(now: Date, lastEventAt: Date | null): boolean {
  if (!lastEventAt) return false;
  return now.getTime() - lastEventAt.getTime() < DUP_MS;
}

export { DUP_MS, AUTO_MS };
