import { UserRoles } from "../../types/common";

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
export type LoginResponse = {
  token: string;
  user: unknown;
  membership: unknown;
  gym: unknown;
};

export type FetchMemberResponse = {
  user: unknown;
  membership: any;
  gym: {
    onlinePaymentsEnabled: boolean;
    geoFencingEnabled: boolean;
  } | null;
  pendingPlanRequest: boolean;
};

export type RegisterResponse = { token: string; user: unknown; gym: unknown };

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
