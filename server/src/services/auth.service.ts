import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { signAccessToken } from "../utils/jwt";
import { generateJoinCode } from "../utils/joinCode";

const SALT_ROUNDS = 10;

export async function registerAdmin(input: {
  email: string;
  password: string;
  name: string;
  gymName: string;
}) {
  const exists = await prisma.user.findUnique({ where: { email: input.email } });
  if (exists) throw new Error("Email already registered");

  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
  let joinCode = generateJoinCode();
  for (let i = 0; i < 5; i++) {
    const clash = await prisma.gym.findUnique({ where: { joinCode } });
    if (!clash) break;
    joinCode = generateJoinCode();
  }

  const gym = await prisma.gym.create({
    data: {
      name: input.gymName,
      joinCode,
      latitude: 0,
      longitude: 0,
      setupCompleted: false,
    },
  });

  const user = await prisma.user.create({
    data: {
      email: input.email,
      passwordHash,
      name: input.name,
      role: Role.ADMIN,
      gymId: gym.id,
    },
  });

  const token = signAccessToken({
    sub: user.id,
    role: user.role,
    gymId: user.gymId,
  });

  return { user, gym, token };
}

export async function registerWithJoinCode(input: {
  joinCode: string;
  email: string;
  password: string;
  name: string;
  phone?: string;
  role: "TRAINER" | "MEMBER";
}) {
  const gym = await prisma.gym.findUnique({ where: { joinCode: input.joinCode } });
  if (!gym) throw new Error("Invalid join code");

  const exists = await prisma.user.findUnique({ where: { email: input.email } });
  if (exists) throw new Error("Email already registered");

  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
  const user = await prisma.user.create({
    data: {
      email: input.email,
      passwordHash,
      name: input.name,
      phone: input.phone,
      role: input.role as Role,
      gymId: gym.id,
    },
  });

  const token = signAccessToken({
    sub: user.id,
    role: user.role,
    gymId: user.gymId,
  });

  return { user, gym, token };
}

export async function login(input: { email: string; password: string }) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) throw new Error("Invalid credentials");

  const ok = await bcrypt.compare(input.password, user.passwordHash);
  if (!ok) throw new Error("Invalid credentials");

  const token = signAccessToken({
    sub: user.id,
    role: user.role,
    gymId: user.gymId,
  });

  const membership = await prisma.membership.findFirst({
    where: { userId: user.id, gymId: user.gymId! },
    orderBy: { endDate: "desc" },
    include: { plan: true },
  });

  const gym = user.gymId ? await prisma.gym.findUnique({ where: { id: user.gymId } }) : null;

  return { user, token, membership, gym };
}

export async function getUserDetails(userId: string, gymId: string | null) {
  const membership = gymId ? await prisma.membership.findFirst({
    where: { userId, gymId },
    orderBy: { endDate: "desc" },
    include: { plan: true },
  }) : null;

  const gym = gymId ? await prisma.gym.findUnique({ where: { id: gymId } }) : null;

  const pendingRequest = gymId ? await prisma.planRequest.findFirst({
    where: { userId, gymId, status: "PENDING" },
  }) : null;

  return { membership, gym, pendingPlanRequest: !!pendingRequest };
}
