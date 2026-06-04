import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ROUTES } from "../../constants/routes";
import { fetchDashboard } from "../../services/admin/admin.services";
import { fetchMyGym } from "../../services/auth/auth.services";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/Card";
import { useToast } from "../../components/ui/Toast";
import { KPIIndicator } from "../../components/admin/KPIIndicator";

function AdminDashboardPage() {
  const navigate = useNavigate();
  const toast = useToast();

  const {
    data: gymData,
    isLoading: gymLoading,
    isError: gymError,
  } = useQuery({ queryKey: ["gym"], queryFn: fetchMyGym });
  const {
    data: dashboardData,
    isLoading: dashboardLoading,
    isError: dashboardError,
  } = useQuery({
    queryKey: ["dashboard"],
    queryFn: fetchDashboard,
  });

  useEffect(() => {
    const gym = gymData as { setupCompleted?: boolean };
    if (gym && !gym.setupCompleted) {
      navigate(ROUTES.ADMIN_SETUP, { replace: true });
    }
  }, [gymData, navigate]);

  if (gymLoading || dashboardLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-brand-accent"></div>
      </div>
    );
  }

  if (dashboardError || gymError) {
    return (
      <div className="p-6 glass-card border-red-500/20 text-red-500 text-center">
        Could not load dashboard metrics.
      </div>
    );
  }

  const kpiData: {
    label: string;
    value: number | undefined;
    variant: "primary" | "warning" | "muted";
  }[] = [
    {
      label: "Total members",
      value: dashboardData?.totalMembers,
      variant: "primary",
    },
    {
      label: "Active memberships",
      value: dashboardData?.activeMembers,
      variant: "primary",
    },
    {
      label: "Expiring (7d)",
      value: dashboardData?.expiringMemberships,
      variant: "warning",
    },
    {
      label: "Inactive (7d)",
      value: dashboardData?.inactiveMembers,
      variant: "muted",
    },
  ];

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-white">System Overview</h2>
          <p className="text-brand-muted font-medium uppercase tracking-[0.2em] text-[10px] mt-1">
            Real-time performance analytics
          </p>
        </div>
        <div className="flex gap-4">
          <div
            className="px-4 py-2 glass-card border-brand-accent/20 flex items-center gap-3 group cursor-pointer active:scale-95 transition-all"
            onClick={() => {
              const code = (gymData as any)?.joinCode;
              if (code) {
                navigator.clipboard.writeText(code);
                toast.success("Gym Code copied to clipboard!");
              }
            }}
          >
            <div className="flex flex-col items-end">
              <span className="text-[8px] font-black uppercase tracking-widest text-brand-muted leading-none">
                Gym Code
              </span>
              <span className="text-sm font-black text-brand-accent tracking-widest leading-tight">
                {(gymData as any)?.joinCode || "----"}
              </span>
            </div>
            <div className="h-8 px-4 py-2 rounded-lg bg-brand-accent/10 border border-brand-accent/20 flex items-center justify-center group-hover:bg-brand-accent/20 transition-colors">
              <span className="text-xs">Copy</span>
            </div>
          </div>
        </div>
      </header>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {kpiData?.map((data, idx) => (
          <KPIIndicator
            key={idx}
            label={data?.label}
            value={data?.value}
            variant={data?.variant}
          />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-1">
        <Card className="h-full flex flex-col justify-between">
          <div>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link to={ROUTES.ADMIN_MEMBERS} className="block group">
                <div className="p-4 rounded-xl border border-brand-border/30 bg-brand-bg/50 hover:bg-brand-accent/5 hover:border-brand-accent/30 transition-all flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-widest group-hover:text-brand-accent">
                    Manage Members
                  </span>
                  <span className="text-brand-muted group-hover:translate-x-1 transition-transform">
                    →
                  </span>
                </div>
              </Link>
              <Link to={ROUTES.ADMIN_PLANS} className="block group">
                <div className="p-4 rounded-xl border border-brand-border/30 bg-brand-bg/50 hover:bg-brand-accent/5 hover:border-brand-accent/30 transition-all flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-widest group-hover:text-brand-accent">
                    View Plans
                  </span>
                  <span className="text-brand-muted group-hover:translate-x-1 transition-transform">
                    →
                  </span>
                </div>
              </Link>
            </CardContent>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default AdminDashboardPage;
