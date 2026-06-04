import { apiClient } from "../apiClient";
import { ApiResponse } from "../../types/api";
import {
  FetchGymResponse,
  FetchMemberResponse,
  GymSettingsPayload,
  GymSetupResponse,
  LoginPayload,
  LoginResponse,
  QrTokenPayload,
  QrTokenResponse,
  RegisterAdminPayload,
  RegisterMemberPayload,
  RegisterResponse,
  ScanAttendancePayload,
} from "./auth.types";
export type { GymRecord } from "./auth.types";


export async function login(payload: LoginPayload) {
  const { data } = await apiClient.post<ApiResponse<LoginResponse>>(
    "/auth/login",
    payload,
  );
  return data.data;
}

export async function fetchMemberPayload() {
  const { data } =
    await apiClient.get<ApiResponse<FetchMemberResponse>>("/auth/me");
  return data.data;
}

export async function registerAdmin(body: RegisterAdminPayload) {
  const { data } = await apiClient.post<ApiResponse<RegisterResponse>>(
    "/auth/register/admin",
    body,
  );
  return data.data;
}

export async function registerMember(body: RegisterMemberPayload) {
  const { data } = await apiClient.post<ApiResponse<RegisterResponse>>(
    "/auth/register",
    body,
  );
  return data.data;
}

export async function fetchMyGym() {
  const { data } = await apiClient.get<ApiResponse<FetchGymResponse>>("/gym");
  return data.data.gym;
}

export async function completeGymSetup(body: GymSetupResponse) {
  const { data } = await apiClient.patch<ApiResponse<FetchGymResponse>>(
    "/gym/setup",
    body,
  );
  return data.data.gym;
}

export async function updateGymSettings(body: GymSettingsPayload) {
  const { data } = await apiClient.patch<ApiResponse<FetchGymResponse>>(
    "/gym/settings",
    body,
  );
  return data.data.gym;
}

export async function generateQrToken(body: QrTokenPayload) {
  const { data } = await apiClient.post<ApiResponse<QrTokenResponse>>(
    "/qr/token",
    body,
  );
  return data.data;
}

export async function scanAttendance(body: ScanAttendancePayload) {
  const { data } = await apiClient.post<ApiResponse<unknown>>(
    "/attendance/scan",
    body,
  );
  return data.data;
}
