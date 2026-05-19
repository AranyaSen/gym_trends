import { http } from "./http";

type ApiOk<T> = { data: T; error: null };

export async function login(body: { email: string; password: string }) {
  const { data } = await http.post<ApiOk<{ token: string; user: unknown; membership: unknown; gym: unknown }>>(
    "/auth/login",
    body
  );
  return data.data;
}

export async function fetchMe() {
  const { data } = await http.get<ApiOk<{ 
    user: unknown; 
    membership: any; 
    gym: { onlinePaymentsEnabled: boolean } | null;
    pendingPlanRequest: boolean;
  }>>("/auth/me");
  return data.data;
}

export async function registerAdmin(body: {
  email: string;
  password: string;
  name: string;
  gymName: string;
}) {
  const { data } = await http.post<ApiOk<{ token: string; user: unknown; gym: unknown }>>(
    "/auth/register/admin",
    body
  );
  return data.data;
}

export async function registerJoin(body: {
  joinCode: string;
  email: string;
  password: string;
  name: string;
  phone?: string;
  role: "TRAINER" | "MEMBER";
}) {
  const { data } = await http.post<ApiOk<{ token: string; user: unknown; gym: unknown }>>(
    "/auth/register",
    body
  );
  return data.data;
}

export async function fetchMyGym() {
  const { data } = await http.get<ApiOk<{ gym: unknown }>>("/gym");
  return data.data.gym;
}

export async function completeGymSetup(body: {
  name: string;
  latitude: number;
  longitude: number;
  gracePeriodDays: number;
  onlinePaymentsEnabled: boolean;
}) {
  const { data } = await http.patch<ApiOk<{ gym: unknown }>>("/gym/setup", body);
  return data.data.gym;
}

export async function mintQrToken(body: { type: "ENTRY" | "EXIT" }) {
  const { data } = await http.post<ApiOk<{ token: string; expiresAt: string }>>(
    "/qr/token",
    body
  );
  return data.data;
}

export async function scanAttendance(body: {
  token: string;
  latitude: number;
  longitude: number;
}) {
  const { data } = await http.post<ApiOk<unknown>>("/attendance/scan", body);
  return data.data;
}
