import { apiClient } from "../apiClient";
import { ApiResponse } from "../../types/api";
import { API_ROUTES } from "../../constants/apiRoutes";
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
    API_ROUTES.PLAN_REQUESTS.CREATE,
    body,
  );
  return data.data.request;
}

export async function fetchPlanRequests(): Promise<unknown[]> {
  const { data } = await apiClient.get<ApiResponse<FetchPlanRequestsResponse>>(API_ROUTES.PLAN_REQUESTS.LIST);
  return data.data.requests;
}

export async function approvePlanRequest(requestId: string): Promise<unknown> {
  const { data } = await apiClient.post<ApiResponse<PlanRequestResponse>>(
    API_ROUTES.PLAN_REQUESTS.APPROVE(requestId),
  );
  return data.data.request;
}

export async function rejectPlanRequest(requestId: string): Promise<unknown> {
  const { data } = await apiClient.post<ApiResponse<PlanRequestResponse>>(
    API_ROUTES.PLAN_REQUESTS.REJECT(requestId),
  );
  return data.data.request;
}

export async function createRazorpayOrder(body: CreateRazorpayOrderPayload): Promise<CreateRazorpayOrderResponse> {
  const { data } = await apiClient.post<ApiResponse<CreateRazorpayOrderResponse>>(
    API_ROUTES.PAYMENTS.RAZORPAY_ORDER,
    body,
  );
  return data.data;
}

export async function fetchPlans(): Promise<PlanRequestPlan[]> {
  const { data } = await apiClient.get<ApiResponse<FetchPlansResponse>>(API_ROUTES.PLANS.LIST);
  return data.data.plans;
}
