import { http } from "./http";

type Api<T> = { data: T; error: null };

export type DashboardStats = {
  totalMembers: number;
  activeMembers: number;
  expiringMemberships: number;
  inactiveMembers: number;
  peakEntryHours: { hour: number; count: number }[];
};

export async function fetchDashboard() {
  const { data } = await http.get<Api<{ stats: DashboardStats }>>(
    "/dashboard"
  );
  return data.data.stats;
}

export async function fetchPlans() {
  const { data } = await http.get<Api<{ plans: PlanRow[] }>>("/plans");
  return data.data.plans;
}

export type PlanRow = {
  id: string;
  name: string;
  priceCents: number;
  durationDays: number;
  isActive: boolean;
};

export async function createPlan(body: {
  name: string;
  priceCents: number;
  durationDays: number;
}) {
  const { data } = await http.post<Api<{ plan: PlanRow }>>("/plans", body);
  return data.data.plan;
}

export async function deactivatePlan(id: string) {
  await http.post(`/plans/${id}/deactivate`);
}

export async function fetchMembers(params?: { q?: string; skip?: number }) {
  const { data } = await http.get<Api<{ items: MemberRow[]; total: number }>>(
    "/users/members",
    { params }
  );
  return data.data;
}

export type MemberRow = {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  memberships: { endDate: string; plan: { name: string } }[];
};

export async function assignMembership(body: {
  memberEmail: string;
  planId: string;
}) {
  await http.post("/memberships/assign", body);
}

export async function renewMembership(body: {
  memberEmail: string;
  planId: string;
}) {
  await http.post("/memberships/renew", body);
}

export async function switchMembership(body: {
  memberEmail: string;
  planId: string;
  changeType: "UPGRADE" | "DOWNGRADE";
}) {
  await http.post("/memberships/switch", body);
}

export async function fetchTrainers() {
  const { data } = await http.get<Api<{ trainers: TrainerRow[] }>>(
    "/trainers"
  );
  return data.data.trainers;
}

export type TrainerRow = {
  id: string;
  email: string;
  name: string;
  phone: string | null;
};

export async function linkTrainerMember(body: {
  trainerId: string;
  memberId: string;
}) {
  await http.post("/trainer-members", body);
}

export async function unlinkTrainerMember(trainerId: string, memberId: string) {
  await http.delete(`/trainer-members/${trainerId}/${memberId}`);
}

export async function fetchAttendance(params: Record<string, string>) {
  const { data } = await http.get<
    Api<{
      items: {
        id: string;
        checkInAt: string;
        checkOutAt: string | null;
        source: string;
        user: { email: string; name: string };
      }[];
      total: number;
    }>
  >("/attendance", { params });
  return data.data;
}

export async function createManualAttendance(body: {
  memberEmail: string;
  checkInAt: string;
  checkOutAt?: string | null;
}) {
  await http.post("/attendance/manual", body);
}

export async function fetchAuditLogs(params: Record<string, string>) {
  const { data } = await http.get<
    Api<{
      items: {
        id: string;
        action: string;
        entityType: string;
        entityId: string | null;
        createdAt: string;
        adminUserId: string;
      }[];
      total: number;
    }>
  >("/audit-logs", { params });
  return data.data;
}

export function downloadExport(
  path: string,
  filename: string,
  params?: Record<string, string>
) {
  return http
    .get(path, { params, responseType: "blob" })
    .then((res) => {
      const url = window.URL.createObjectURL(res.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      window.URL.revokeObjectURL(url);
    });
}
