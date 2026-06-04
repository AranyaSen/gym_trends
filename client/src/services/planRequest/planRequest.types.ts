export type CreatePlanRequestPayload = {
  planId: string;
};

export type PlanRequestResponse = {
  request: unknown;
};

export type FetchPlanRequestsResponse = {
  requests: unknown[];
};

export type CreateRazorpayOrderPayload = {
  planId: string;
};

export type CreateRazorpayOrderResponse = {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
  paymentId: string;
};

export type PlanRequestPlan = {
  id: string;
  name: string;
  priceCents: number;
  durationDays: number;
  isActive: boolean;
};

export type FetchPlansResponse = {
  plans: PlanRequestPlan[];
};
