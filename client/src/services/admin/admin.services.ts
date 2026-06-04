import { apiClient } from "../apiClient";
import { ApiResponse } from "../../types/api";
import { API_ROUTES } from "../../constants/apiRoutes";
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
  const { data } = await apiClient.get<ApiResponse<FetchDashboardResponse>>(API_ROUTES.DASHBOARD.GET);
  return data.data.stats;
}

export async function fetchPlans(): Promise<PlanRow[]> {
  const { data } = await apiClient.get<ApiResponse<FetchPlansResponse>>(API_ROUTES.PLANS.LIST);
  return data.data.plans;
}

export async function createPlan(body: CreatePlanPayload): Promise<PlanRow> {
  const { data } = await apiClient.post<ApiResponse<CreatePlanResponse>>(API_ROUTES.PLANS.CREATE, body);
  return data.data.plan;
}

export async function deactivatePlan(id: string): Promise<void> {
  await apiClient.post<ApiResponse<unknown>>(API_ROUTES.PLANS.DEACTIVATE(id));
}

export async function fetchMembers(params?: FetchMembersParams): Promise<FetchMembersResponse> {
  const { data } = await apiClient.get<ApiResponse<FetchMembersResponse>>(
    API_ROUTES.USERS.MEMBERS,
    { params },
  );
  return data.data;
}

export async function assignMembership(body: AssignMembershipPayload): Promise<void> {
  await apiClient.post<ApiResponse<unknown>>(API_ROUTES.MEMBERSHIPS.ASSIGN, body);
}

export async function renewMembership(body: RenewMembershipPayload): Promise<void> {
  await apiClient.post<ApiResponse<unknown>>(API_ROUTES.MEMBERSHIPS.RENEW, body);
}

export async function switchMembership(body: SwitchMembershipPayload): Promise<void> {
  await apiClient.post<ApiResponse<unknown>>(API_ROUTES.MEMBERSHIPS.SWITCH, body);
}

export async function fetchTrainers(): Promise<TrainerRow[]> {
  const { data } = await apiClient.get<ApiResponse<FetchTrainersResponse>>(API_ROUTES.TRAINERS.LIST);
  return data.data.trainers;
}

export async function linkTrainerMember(body: LinkTrainerMemberPayload): Promise<void> {
  await apiClient.post<ApiResponse<unknown>>(API_ROUTES.TRAINERS.LINK, body);
}

export async function unlinkTrainerMember(trainerId: string, memberId: string): Promise<void> {
  await apiClient.delete<ApiResponse<unknown>>(API_ROUTES.TRAINERS.UNLINK(trainerId, memberId));
}

export async function fetchAttendance(params: Record<string, string>): Promise<FetchAttendanceResponse> {
  const { data } = await apiClient.get<ApiResponse<FetchAttendanceResponse>>(API_ROUTES.ATTENDANCE.LIST, { params });
  return data.data;
}

export async function createManualAttendance(body: CreateManualAttendancePayload): Promise<void> {
  await apiClient.post<ApiResponse<unknown>>(API_ROUTES.ATTENDANCE.MANUAL, body);
}

export async function fetchAuditLogs(params: Record<string, string>): Promise<FetchAuditLogsResponse> {
  const { data } = await apiClient.get<ApiResponse<FetchAuditLogsResponse>>(API_ROUTES.AUDIT_LOGS.LIST, { params });
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
