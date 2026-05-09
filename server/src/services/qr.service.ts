import { QrType } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { env } from "../config/env";
import { signQrToken } from "../utils/jwt";

export async function createQrForGym(gymId: string, type: QrType) {
  const expiresAt = new Date(
    Date.now() + env.qrTokenMinutes * 60 * 1000
  );
  const row = await prisma.qrToken.create({
    data: { gymId, type, expiresAt },
  });
  const token = signQrToken(
    { jti: row.id, gymId, type: type === QrType.ENTRY ? "ENTRY" : "EXIT" },
    env.qrTokenMinutes * 60
  );
  return { token, expiresAt: row.expiresAt, tokenId: row.id };
}
