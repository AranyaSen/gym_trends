import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ROUTES } from "../../constants/routes";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { fetchMemberPayload } from "../../services/auth/auth.services";
import {
  createPlanRequest,
  createRazorpayOrder,
  fetchPlans,
} from "../../services/planRequest/planRequest.services";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../components/ui/Toast";
import { formatDate } from "../../lib/utils/dateTimeFormat";
import { MemberShipType } from "../../services/auth/auth.types";

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if ((window as any).Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

function MemberHomePage() {
  const { logout } = useAuth();
  const queryClient = useQueryClient();
  const toast = useToast();

  const { data, isLoading } = useQuery({
    queryKey: ["auth_me"],
    queryFn: fetchMemberPayload,
  });

  const { data: plans, isLoading: plansLoading } = useQuery({
    queryKey: ["plans"],
    queryFn: fetchPlans,
    enabled:
      !!data &&
      (!data.membership || data.membership.status !== "ACTIVE") &&
      !data.pendingPlanRequest,
  });

  const requestMutation = useMutation({
    mutationFn: createPlanRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth_me"] });
    },
  });

  const rzpMutation = useMutation({
    mutationFn: createRazorpayOrder,
    onSuccess: async (orderData) => {
      const loaded = await loadRazorpayScript();
      if (!loaded) return toast.error("Failed to load payment gateway");

      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Gym Trac",
        description: "Membership Payment",
        order_id: orderData.orderId,
        handler: function () {
          queryClient.invalidateQueries({ queryKey: ["auth_me"] });
        },
        prefill: {
          name: (data?.user as any)?.name,
          email: (data?.user as any)?.email,
        },
        theme: {
          color: "#0f172a",
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    },
  });

  if (isLoading || plansLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-brand-bg relative overflow-hidden">
        <div className="w-16 h-16 border-4 border-brand-accent/20 border-t-brand-accent rounded-full animate-spin" />
      </div>
    );
  }

  const { membership, pendingPlanRequest, gym } = data!;
  const isOnlinePaymentsEnabled = gym?.onlinePaymentsEnabled;

  return (
    <div className="min-h-screen flex flex-col p-6 bg-brand-bg relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-brand-accent/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md mx-auto space-y-8 relative z-10 text-center py-12">
        <header className="space-y-2">
          <h1 className="text-3xl font-black text-white">Member Dashboard</h1>
        </header>

        {pendingPlanRequest ? (
          <PendingPlanRequestComponent />
        ) : membership?.status === "ACTIVE" ? (
          <ActiveMembershipDetails membership={membership} />
        ) : (
          <div className="space-y-6">
            {plans && plans?.length > 0 ? (
              <>
                <div className="text-center">
                  <h2 className="text-2xl font-black text-white">
                    Select a Plan
                  </h2>
                  <p className="text-brand-muted text-sm mt-2">
                    Your membership is inactive. Choose a plan to continue.
                  </p>
                </div>
                <div className="space-y-4">
                  {plans
                    ?.filter((p) => p.isActive)
                    .map((plan) => (
                      <Card
                        key={plan.id}
                        className="border border-white/10 bg-black/40 backdrop-blur text-left overflow-hidden"
                      >
                        <CardContent className="p-4 flex items-center justify-between">
                          <div>
                            <p className="text-lg font-bold text-white">
                              {plan.name}
                            </p>
                            <p className="text-sm text-brand-muted">
                              ₹{(plan.priceCents / 100).toFixed(2)} /{" "}
                              {plan.durationDays} days
                            </p>
                          </div>
                          <div>
                            {isOnlinePaymentsEnabled ? (
                              <Button
                                size="sm"
                                disabled={rzpMutation.isPending}
                                onClick={() =>
                                  rzpMutation.mutate({ planId: plan.id })
                                }
                              >
                                Pay Online
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                disabled={requestMutation.isPending}
                                onClick={() =>
                                  requestMutation.mutate({ planId: plan.id })
                                }
                              >
                                Request Admin
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </>
            ) : (
              <RenderNoPlans />
            )}
          </div>
        )}

        <footer className="pt-4">
          <button
            className="text-xs font-bold uppercase tracking-widest text-brand-muted hover:text-brand-accent transition-colors"
            onClick={logout}
          >
            ← Sign Out
          </button>
        </footer>
      </div>
    </div>
  );
}

function PendingPlanRequestComponent() {
  return (
    <Card className="neon-border overflow-hidden">
      <div className="h-2 w-full bg-yellow-500" />
      <CardHeader>
        <CardTitle>Pending Approval</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-center">
          <div className="w-24 h-24 rounded-full border-4 border-yellow-500/20 flex items-center justify-center relative">
            <div className="absolute inset-0 rounded-full border-t-4 border-yellow-500 animate-spin-slow" />
            <span className="text-3xl font-black text-yellow-500">⏳</span>
          </div>
        </div>
        <p className="text-sm text-brand-muted px-4 leading-relaxed">
          Your membership request is currently pending admin approval. You will
          have access once approved.
        </p>
      </CardContent>
    </Card>
  );
}

function ActiveMembershipDetails({
  membership,
}: {
  membership: MemberShipType;
}) {
  return (
    <Card className="neon-border overflow-hidden">
      <div className="h-2 w-full bg-brand-accent" />
      <CardHeader>
        <CardTitle>Training Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-4 bg-brand-accent/10 border border-brand-accent/20 rounded-lg space-y-2">
          <p className="text-lg font-bold text-white">{membership.plan.name}</p>
          <div className="flex justify-between text-xs text-brand-muted font-bold">
            <span>Price: ₹{(membership.plan.priceCents / 100).toFixed(2)}</span>
            <span>Expires: {formatDate(membership.endDate)}</span>
          </div>
        </div>
        <p className="text-sm text-brand-muted px-4 leading-relaxed">
          Your membership is active. Scan the QR code at the gym entrance to log
          your session.
        </p>
        <Link to={ROUTES.MEMBER_SCAN} className="block">
          <Button size="lg" className="w-full h-14 text-lg">
            Scan Attendance
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

function RenderNoPlans() {
  return (
    <Card
      key="no-plan"
      className="border border-white/10 bg-black/40 backdrop-blur text-left overflow-hidden"
    >
      <CardContent className="p-4 flex items-center justify-between">
        <div>
          <p className="text-lg font-bold text-white">No Plans Available</p>
          <p className="text-sm text-brand-muted">
            Contact your gym admin for more information.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default MemberHomePage;
