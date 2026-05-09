import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ROUTES } from "../constants/routes";
import { completeGymSetup, fetchMyGym } from "../services/authApi";
import { Button } from "../components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { Input } from "../components/ui/Input";

export function AdminSetupPage() {
  const nav = useNavigate();
  const q = useQuery({ queryKey: ["gym"], queryFn: fetchMyGym });
  const [name, setName] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [grace, setGrace] = useState("0");
  const [online, setOnline] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const m = useMutation({
    mutationFn: () =>
      completeGymSetup({
        name,
        latitude: Number(latitude),
        longitude: Number(longitude),
        gracePeriodDays: Number(grace),
        onlinePaymentsEnabled: online,
      }),
    onSuccess: () => nav(ROUTES.admin, { replace: true }),
    onError: (e: unknown) => {
      const msg =
        e && typeof e === "object" && "response" in e
          ? String(
              (e as { response?: { data?: { error?: { message?: string } } } })
                .response?.data?.error?.message
            )
          : "Could not save";
      setErr(msg || "Could not save");
    },
  });

  const gym = q.data as { setupCompleted?: boolean; name?: string } | undefined;

  useEffect(() => {
    if (gym?.setupCompleted) {
      nav(ROUTES.admin, { replace: true });
    }
  }, [gym?.setupCompleted, nav]);

  if (q.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-bg">
        <p className="text-brand-accent animate-pulse font-bold tracking-widest uppercase text-xs">Loading gym profile…</p>
      </div>
    );
  }

  if (gym?.setupCompleted) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-brand-bg relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-brand-accent/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-brand-accent/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md space-y-8 relative z-10">
        <header className="text-center space-y-2">
          <Link to={ROUTES.home} className="inline-block transition-transform hover:scale-105">
            <h1 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50">
              GYM-TRAC
            </h1>
          </Link>
          <p className="text-brand-muted font-bold uppercase tracking-[0.2em] text-[10px]">
            Finalize your setup
          </p>
        </header>

        <Card className="neon-border">
          <CardHeader>
            <CardTitle className="text-center">Gym Configuration</CardTitle>
            <p className="mt-2 text-center text-xs text-brand-muted">
              Configure your gym's location and membership rules.
            </p>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                setErr(null);
                m.mutate();
              }}
            >
              <Input
                label="Gym Display Name"
                placeholder={gym?.name || "Elite Fitness"}
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Latitude"
                  placeholder="0.0000"
                  required
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                />
                <Input
                  label="Longitude"
                  placeholder="0.0000"
                  required
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                />
              </div>

              <Input
                label="Grace Period (Days)"
                type="number"
                min={0}
                required
                value={grace}
                onChange={(e) => setGrace(e.target.value)}
              />

              <label className="flex items-center gap-3 p-3 rounded-lg border border-brand-border/30 bg-brand-surface/30 cursor-pointer hover:border-brand-accent/30 transition-colors group">
                <div className="relative flex items-center justify-center">
                  <input
                    type="checkbox"
                    className="peer sr-only"
                    checked={online}
                    onChange={(e) => setOnline(e.target.checked)}
                  />
                  <div className="w-5 h-5 border-2 border-brand-border rounded peer-checked:border-brand-accent peer-checked:bg-brand-accent transition-all" />
                  <svg
                    className="absolute w-3 h-3 text-brand-bg opacity-0 peer-checked:opacity-100 transition-opacity"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="3"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 group-hover:text-slate-200 transition-colors">
                  Enable online payments (Razorpay)
                </span>
              </label>

              {err && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-bold uppercase tracking-wider text-center">
                  {err}
                </div>
              )}

              <Button
                type="submit"
                disabled={m.isPending}
                className="w-full mt-2"
              >
                {m.isPending ? "Saving…" : "Save and Continue"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <footer className="text-center">
          <Link 
            className="text-xs font-bold uppercase tracking-widest text-brand-muted hover:text-brand-accent transition-colors" 
            to={ROUTES.admin}
          >
            ← Cancel and Back
          </Link>
        </footer>
      </div>
    </div>
  );
}
