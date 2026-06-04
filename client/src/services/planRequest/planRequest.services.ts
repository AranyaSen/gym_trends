import { apiClient } from "../apiClient";
import { ApiResponse } from "../../types/api";
import {
  CreatePlanRequestPayload,
  PlanRequestResponse,
  FetchPlanRequestsResponse,
  CreateRazorpayOrderPayload,
  CreateRazorpayOrderResponse,
  PlanRequestPlan,
  FetchPlansResponse,
} from "./planRequest.types";

export async function createPlanRequest(body: CreatePlanRequestPayload): Promise<unknown> {
  const { data } = await apiClient.post<ApiResponse<PlanRequestResponse>>(
    "/plan-requests",
    body,
  );
  return data.data.request;
}

export async function fetchPlanRequests(): Promise<unknown[]> {
  const { data } = await apiClient.get<ApiResponse<FetchPlanRequestsResponse>>("/plan-requests");
  return data.data.requests;
}

export async function approvePlanRequest(requestId: string): Promise<unknown> {
  const { data } = await apiClient.post<ApiResponse<PlanRequestResponse>>(
    `/plan-requests/${requestId}/approve`,
  );
  return data.data.request;
}

export async function rejectPlanRequest(requestId: string): Promise<unknown> {
  const { data } = await apiClient.post<ApiResponse<PlanRequestResponse>>(
    `/plan-requests/${requestId}/reject`,
  );
  return data.data.request;
}

export async function createRazorpayOrder(body: CreateRazorpayOrderPayload): Promise<CreateRazorpayOrderResponse> {
  const { data } = await apiClient.post<ApiResponse<CreateRazorpayOrderResponse>>(
    "/payments/razorpay/order",
    body,
  );
  return data.data;
}

export async function fetchPlans(): Promise<PlanRequestPlan[]> {
  const { data } = await apiClient.get<ApiResponse<FetchPlansResponse>>("/plans");
  return data.data.plans;
}
