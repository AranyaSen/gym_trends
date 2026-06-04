import { PaginationResponseType } from "../../types/api";

export type DashboardStats = {
  totalMembers: number;
  activeMembers: number;
  expiringMemberships: number;
  inactiveMembers: number;
  peakEntryHours: { hour: number; count: number }[];
};

export type FetchDashboardResponse = {
  stats: DashboardStats;
};

export type PlanRow = {
  id: string;
  name: string;
  priceCents: number;
  durationDays: number;
  isActive: boolean;
};

export type FetchPlansResponse = {
  plans: PlanRow[];
};

export type CreatePlanPayload = {
  name: string;
  priceCents: number;
  durationDays: number;
};

export type CreatePlanResponse = {
  plan: PlanRow;
};

export type FetchMembersParams = {
  q?: string;
  skip?: number;
};

export type MemberRow = {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  memberships: { endDate: string; plan: { name: string } }[];
};

export type FetchMembersResponse = {
  items: MemberRow[];
  total: number;
};

export type AssignMembershipPayload = {
  memberEmail: string;
  planId: string;
};

export type RenewMembershipPayload = {
  memberEmail: string;
  planId: string;
};

export type SwitchMembershipPayload = {
  memberEmail: string;
  planId: string;
  changeType: "UPGRADE" | "DOWNGRADE";
};

export type TrainerRow = {
  id: string;
  email: string;
  name: string;
  phone: string | null;
};

export type FetchTrainersResponse = {
  trainers: TrainerRow[];
};

export type LinkTrainerMemberPayload = {
  trainerId: string;
  memberId: string;
};

export type AttendanceItem = {
  id: string;
  checkInAt: string;
  checkOutAt: string | null;
  source: string;
  user: { email: string; name: string };
};

export type FetchAttendanceResponse = {
  items: AttendanceItem[];
  total: number;
};

export type CreateManualAttendancePayload = {
  memberEmail: string;
  checkInAt: string;
  checkOutAt?: string | null;
};

export type AuditLogEntry = {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  createdAt: string;
  adminUserId: string;
};

export type FetchAuditLogsResponse = {
  items: AuditLogEntry[];
  pagination: PaginationResponseType;
};

export type AuditLogsParams = {
  page: number;
  itemsPerPage?: number;
};
