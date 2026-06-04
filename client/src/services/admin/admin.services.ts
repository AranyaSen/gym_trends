import { apiClient } from "../apiClient";
import { ApiResponse } from "../../types/api";
import {
  DashboardStats,
  FetchDashboardResponse,
  PlanRow,
  FetchPlansResponse,
  CreatePlanPayload,
  CreatePlanResponse,
  FetchMembersParams,
  FetchMembersResponse,
  AssignMembershipPayload,
  RenewMembershipPayload,
  SwitchMembershipPayload,
  TrainerRow,
  FetchTrainersResponse,
  LinkTrainerMemberPayload,
  FetchAttendanceResponse,
  CreateManualAttendancePayload,
  FetchAuditLogsResponse,
} from "./admin.types";

export async function fetchDashboard(): Promise<DashboardStats> {
  const { data } = await apiClient.get<ApiResponse<FetchDashboardResponse>>("/dashboard");
  return data.data.stats;
}

export async function fetchPlans(): Promise<PlanRow[]> {
  const { data } = await apiClient.get<ApiResponse<FetchPlansResponse>>("/plans");
  return data.data.plans;
}

export async function createPlan(body: CreatePlanPayload): Promise<PlanRow> {
  const { data } = await apiClient.post<ApiResponse<CreatePlanResponse>>("/plans", body);
  return data.data.plan;
}

export async function deactivatePlan(id: string): Promise<void> {
  await apiClient.post<ApiResponse<unknown>>(`/plans/${id}/deactivate`);
}

export async function fetchMembers(params?: FetchMembersParams): Promise<FetchMembersResponse> {
  const { data } = await apiClient.get<ApiResponse<FetchMembersResponse>>(
    "/users/members",
    { params },
  );
  return data.data;
}

export async function assignMembership(body: AssignMembershipPayload): Promise<void> {
  await apiClient.post<ApiResponse<unknown>>("/memberships/assign", body);
}

export async function renewMembership(body: RenewMembershipPayload): Promise<void> {
  await apiClient.post<ApiResponse<unknown>>("/memberships/renew", body);
}

export async function switchMembership(body: SwitchMembershipPayload): Promise<void> {
  await apiClient.post<ApiResponse<unknown>>("/memberships/switch", body);
}

export async function fetchTrainers(): Promise<TrainerRow[]> {
  const { data } = await apiClient.get<ApiResponse<FetchTrainersResponse>>("/trainers");
  return data.data.trainers;
}

export async function linkTrainerMember(body: LinkTrainerMemberPayload): Promise<void> {
  await apiClient.post<ApiResponse<unknown>>("/trainer-members", body);
}

export async function unlinkTrainerMember(trainerId: string, memberId: string): Promise<void> {
  await apiClient.delete<ApiResponse<unknown>>(`/trainer-members/${trainerId}/${memberId}`);
}

export async function fetchAttendance(params: Record<string, string>): Promise<FetchAttendanceResponse> {
  const { data } = await apiClient.get<ApiResponse<FetchAttendanceResponse>>("/attendance", { params });
  return data.data;
}

export async function createManualAttendance(body: CreateManualAttendancePayload): Promise<void> {
  await apiClient.post<ApiResponse<unknown>>("/attendance/manual", body);
}

export async function fetchAuditLogs(params: Record<string, string>): Promise<FetchAuditLogsResponse> {
  const { data } = await apiClient.get<ApiResponse<FetchAuditLogsResponse>>("/audit-logs", { params });
  return data.data;
}

export function downloadExport(
  path: string,
  filename: string,
  params?: Record<string, string>,
): Promise<void> {
  return apiClient.get(path, { params, responseType: "blob" }).then((res) => {
    const url = window.URL.createObjectURL(res.data);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  });
}
