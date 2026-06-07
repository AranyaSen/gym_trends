import { apiClient } from "../apiClient";
import { ApiResponse } from "../../types/api";
import { API_ROUTES } from "../../constants/apiRoutes";
import {
  FetchGymResponse,
  FetchMemberResponse,
  GymSettingsPayload,
  GymSetupResponse,
  LoginPayload,
  UserLoginResponse,
  QrTokenPayload,
  QrTokenResponse,
  RegisterAdminPayload,
  RegisterMemberPayload,
  RegisterResponse,
  ScanAttendancePayload,
} from "./auth.types";
export type { GymRecord } from "./auth.types";

export async function login(payload: LoginPayload) {
  const { data } = await apiClient.post<ApiResponse<UserLoginResponse>>(
    API_ROUTES.AUTH.LOGIN,
    payload,
  );
  return data.data;
}

export async function fetchMemberPayload() {
  const { data } = await apiClient.get<ApiResponse<FetchMemberResponse>>(
    API_ROUTES.AUTH.ME,
  );
  return data.data;
}

export async function registerAdmin(body: RegisterAdminPayload) {
  const { data } = await apiClient.post<ApiResponse<RegisterResponse>>(
    API_ROUTES.AUTH.REGISTER_ADMIN,
    body,
  );
  return data.data;
}

export async function registerMember(body: RegisterMemberPayload) {
  const { data } = await apiClient.post<ApiResponse<RegisterResponse>>(
    API_ROUTES.AUTH.REGISTER_MEMBER,
    body,
  );
  return data.data;
}

export async function fetchMyGym() {
  const { data } = await apiClient.get<ApiResponse<FetchGymResponse>>(
    API_ROUTES.GYM.GET,
  );
  return data.data.gym;
}

export async function completeGymSetup(body: GymSetupResponse) {
  const { data } = await apiClient.patch<ApiResponse<FetchGymResponse>>(
    API_ROUTES.GYM.SETUP,
    body,
  );
  return data.data.gym;
}

export async function updateGymSettings(body: GymSettingsPayload) {
  const { data } = await apiClient.patch<ApiResponse<FetchGymResponse>>(
    API_ROUTES.GYM.SETTINGS,
    body,
  );
  return data.data.gym;
}

export async function generateQrToken(body: QrTokenPayload) {
  const { data } = await apiClient.post<ApiResponse<QrTokenResponse>>(
    API_ROUTES.QR.TOKEN,
    body,
  );
  return data.data;
}

export async function scanAttendance(body: ScanAttendancePayload) {
  const { data } = await apiClient.post<ApiResponse<unknown>>(
    API_ROUTES.ATTENDANCE.SCAN,
    body,
  );
  return data.data;
}
