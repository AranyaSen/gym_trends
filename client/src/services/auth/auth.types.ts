import { Gym, UserRoles, UserType } from "../../types/common";

export type GymRecord = {
  id: string;
  name: string;
  joinCode: string;
  latitude: number;
  longitude: number;
  gracePeriodDays: number;
  onlinePaymentsEnabled: boolean;
  geoFencingEnabled: boolean;
  setupCompleted: boolean;
};

export type QrTokenPayload = { type: "ENTRY" };

export type ScanAttendancePayload = {
  token: string;
  latitude?: number;
  longitude?: number;
};

export type GymSettingsPayload = {
  onlinePaymentsEnabled?: boolean;
  geoFencingEnabled?: boolean;
  latitude?: number;
  longitude?: number;
};

type User = {
  id: string;
  role: UserRoles;
  gymId: string;
};

type MembershipStatusType = "ACTIVE" | "EXPIRED" | "CANCELLED";

type PlanType = {
  id: string;
  gymId: string;
  name: string;
  priceCents: number;
  durationDays: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type MemberShipType = {
  id: string;
  gymId: string;
  userId: string;
  planId: string;
  startDate: string;
  endDate: string;
  status: MembershipStatusType;
  createdAt: string;
  updatedAt: string;
  plan: PlanType;
};

// Payload Types
export type LoginPayload = { email: string; password: string };

export type RegisterAdminPayload = {
  email: string;
  password: string;
  name: string;
  gymName: string;
};

export type RegisterMemberPayload = {
  joinCode: string;
  email: string;
  password: string;
  name: string;
  phone?: string;
  role: UserRoles;
};

// Response Types
export type UserLoginResponse = {
  token: string;
  user: UserType;
  membership: MemberShipType;
  gym: Gym;
  pendingPlanRequest: boolean;
};

export type FetchMemberResponse = {
  user: User;
  membership: MemberShipType;
  gym: {
    onlinePaymentsEnabled: boolean;
    geoFencingEnabled: boolean;
  };
  pendingPlanRequest: boolean;
};

export type RegisterResponse = { token: string; user: UserType; gym: Gym };

export type FetchGymResponse = { gym: GymRecord };

export type GymSetupResponse = {
  name: string;
  latitude: number;
  longitude: number;
  gracePeriodDays: number;
  onlinePaymentsEnabled: boolean;
};

export type QrTokenResponse = {
  token: string;
  expiresAt: string;
};
