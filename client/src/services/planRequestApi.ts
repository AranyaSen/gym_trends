import { http } from "./http";

type ApiOk<T> = { data: T; error: null };

export async function createPlanRequest(body: { planId: string }) {
  const { data } = await http.post<ApiOk<{ request: unknown }>>("/plan-requests", body);
  return data.data.request;
}

export async function fetchPlanRequests() {
  const { data } = await http.get<ApiOk<{ requests: unknown[] }>>("/plan-requests");
  return data.data.requests;
}

export async function approvePlanRequest(requestId: string) {
  const { data } = await http.post<ApiOk<{ request: unknown }>>(`/plan-requests/${requestId}/approve`);
  return data.data.request;
}

export async function rejectPlanRequest(requestId: string) {
  const { data } = await http.post<ApiOk<{ request: unknown }>>(`/plan-requests/${requestId}/reject`);
  return data.data.request;
}

export async function createRazorpayOrder(body: { planId: string }) {
  const { data } = await http.post<ApiOk<{ orderId: string; amount: number; currency: string; keyId: string; paymentId: string }>>("/payments/razorpay/order", body);
  return data.data;
}

export async function fetchPlans() {
  const { data } = await http.get<ApiOk<{ plans: { id: string; name: string; priceCents: number; durationDays: number; isActive: boolean; }[] }>>("/plans");
  return data.data.plans;
}
