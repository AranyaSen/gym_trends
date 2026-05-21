import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ROUTES } from "../../constants/routes";
import { fetchDashboard } from "../../services/adminApi";
import { fetchMyGym } from "../../services/authApi";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/Card";
import { useToast } from "../../components/ui/Toast";

export function AdminDashboardPage() {
  const nav = useNavigate();
  const toast = useToast();
  const gq = useQuery({ queryKey: ["gym"], queryFn: fetchMyGym });
  const q = useQuery({ queryKey: ["dashboard"], queryFn: fetchDashboard });

  useEffect(() => {
    const gym = gq.data as { setupCompleted?: boolean } | undefined;
    if (gym && !gym.setupCompleted) {
      nav(ROUTES.adminSetup, { replace: true });
    }
  }, [gq.data, nav]);

  if (gq.isLoading || q.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-brand-accent"></div>
      </div>
    );
  }

  if (q.isError) {
    return (
      <div className="p-6 glass-card border-red-500/20 text-red-500 text-center">
        Could not load dashboard metrics.
      </div>
    );
  }

  const s = q.data!;

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
              const code = (gq.data as any)?.joinCode;
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
                {(gq.data as any)?.joinCode || "----"}
              </span>
            </div>
            <div className="h-8 px-4 py-2 rounded-lg bg-brand-accent/10 border border-brand-accent/20 flex items-center justify-center group-hover:bg-brand-accent/20 transition-colors">
              <span className="text-xs">Copy</span>
            </div>
          </div>
        </div>
      </header>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="Total members"
          value={s.totalMembers}
          trend="+12% this month"
        />
        <Stat
          label="Active memberships"
          value={s.activeMembers}
          trend="Steady"
        />
        <Stat
          label="Expiring (7d)"
          value={s.expiringMemberships}
          variant="warning"
        />
        <Stat label="Inactive (7d)" value={s.inactiveMembers} variant="muted" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 neon-border">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Peak Entry Hours</span>
              <span className="text-[10px] text-brand-muted font-normal normal-case tracking-normal">
                Last 30 Days
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {s.peakEntryHours.length === 0 ? (
                <p className="text-sm text-brand-muted italic py-10 text-center">
                  No attendance data collected yet.
                </p>
              ) : (
                s.peakEntryHours.map((p) => (
                  <div key={p.hour} className="space-y-2">
                    <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                      <span className="text-white">
                        {String(p.hour).padStart(2, "0")}:00
                      </span>
                      <span className="text-brand-accent">
                        {p.count} check-ins
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-brand-surface rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand-accent shadow-[0_0_10px_rgba(193,255,0,0.4)] transition-all duration-1000"
                        style={{
                          width: `${Math.min(100, (p.count / Math.max(...s.peakEntryHours.map((x) => x.count))) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="h-full flex flex-col justify-between">
          <div>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link to={ROUTES.adminMembers} className="block group">
                <div className="p-4 rounded-xl border border-brand-border/30 bg-brand-bg/50 hover:bg-brand-accent/5 hover:border-brand-accent/30 transition-all flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-widest group-hover:text-brand-accent">
                    Manage Members
                  </span>
                  <span className="text-brand-muted group-hover:translate-x-1 transition-transform">
                    →
                  </span>
                </div>
              </Link>
              <Link to={ROUTES.adminAttendance} className="block group">
                <div className="p-4 rounded-xl border border-brand-border/30 bg-brand-bg/50 hover:bg-brand-accent/5 hover:border-brand-accent/30 transition-all flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-widest group-hover:text-brand-accent">
                    View Logs
                  </span>
                  <span className="text-brand-muted group-hover:translate-x-1 transition-transform">
                    →
                  </span>
                </div>
              </Link>
            </CardContent>
          </div>
          <div className="p-6 mt-4 rounded-2xl bg-gradient-to-br from-brand-accent to-brand-accent/60 p-1">
            <div className="bg-brand-bg rounded-[14px] p-5">
              <h4 className="text-xs font-black text-white">PRO TIP</h4>
              <p className="text-[10px] text-brand-muted mt-2 leading-relaxed italic">
                "Peak hours are between 17:00 and 19:00. Consider assigning more
                trainers during this window."
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  trend,
  variant = "primary",
}: {
  label: string;
  value: number;
  trend?: string;
  variant?: "primary" | "warning" | "muted";
}) {
  const colors = {
    primary: "text-brand-accent",
    warning: "text-amber-400",
    muted: "text-brand-muted",
  };

  return (
    <div className="glass-card flex flex-col justify-between h-32 hover:border-brand-accent/20 transition-all duration-300 group">
      <div className="flex justify-between items-start">
        <p className="text-[10px] font-black uppercase tracking-wider text-brand-muted">
          {label}
        </p>
        <div className="w-1.5 h-1.5 rounded-full bg-brand-accent/20 group-hover:bg-brand-accent transition-colors" />
      </div>
      <div>
        <p className={`text-3xl font-black ${colors[variant]}`}>{value}</p>
        {trend && (
          <p className="text-[10px] font-medium text-slate-500 mt-1">{trend}</p>
        )}
      </div>
    </div>
  );
}
