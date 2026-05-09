import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ROUTES } from "../../constants/routes";
import { completeGymSetup, fetchMyGym } from "../../services/authApi";
import { Button } from "../../components/ui/Button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { gymSetupSchema, type GymSetupFormValues } from "../../schemas/gym";
import { useTrackLocation } from "../../hooks/useTrackLocation";
import { Loader } from "../../components/ui/Loader";

export function AdminSetupPage() {
  const nav = useNavigate();
  const q = useQuery({ queryKey: ["gym"], queryFn: fetchMyGym });
  const [err, setErr] = useState<string | null>(null);
  const { location, loading } = useTrackLocation();

  useEffect(() => {
    if (location) {
      setValue("latitude", location.latitude.toString());
      setValue("longitude", location.longitude.toString());
    }
  }, [location]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<GymSetupFormValues>({
    resolver: zodResolver(gymSetupSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      latitude: "",
      longitude: "",
      gracePeriodDays: "0",
      onlinePaymentsEnabled: false,
    },
  });

  const online = watch("onlinePaymentsEnabled");

  const m = useMutation({
    mutationFn: (values: GymSetupFormValues) =>
      completeGymSetup({
        name: values.name,
        latitude: Number(values.latitude),
        longitude: Number(values.longitude),
        gracePeriodDays: Number(values.gracePeriodDays),
        onlinePaymentsEnabled: values.onlinePaymentsEnabled || false,
      }),
    onSuccess: () => nav(ROUTES.admin, { replace: true }),
    onError: (e: unknown) => {
      const msg =
        e && typeof e === "object" && "response" in e
          ? String(
              (e as { response?: { data?: { error?: { message?: string } } } })
                .response?.data?.error?.message,
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

  const onSubmit = (values: GymSetupFormValues) => {
    setErr(null);
    m.mutate(values);
  };

  if (q.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-bg">
        <p className="text-brand-accent animate-pulse font-bold tracking-widest uppercase text-xs">
          Loading gym profile…
        </p>
      </div>
    );
  }

  if (gym?.setupCompleted) {
    return null;
  }

  if (loading) {
    return <Loader message="Fetching location..." />;
  }

  return (
    <div className="min-h-fit flex items-center justify-center p-6 bg-brand-bg relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-brand-accent/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-brand-accent/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md space-y-8 relative z-10">
        <header className="text-center space-y-2">
          <Link
            to={ROUTES.home}
            className="inline-block transition-transform hover:scale-105"
          >
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
            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
              <Input
                label="Gym Display Name"
                placeholder={gym?.name || "Elite Fitness"}
                {...register("name")}
                error={errors.name?.message}
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Latitude"
                  placeholder="0.0000"
                  {...register("latitude")}
                  error={errors.latitude?.message}
                />
                <Input
                  label="Longitude"
                  placeholder="0.0000"
                  {...register("longitude")}
                  error={errors.longitude?.message}
                />
              </div>

              <Input
                label="Grace Period (Days)"
                type="number"
                min={0}
                {...register("gracePeriodDays")}
                error={errors.gracePeriodDays?.message}
              />

              <label className="flex items-center gap-3 p-3 rounded-lg border border-brand-border/30 bg-brand-surface/30 cursor-pointer hover:border-brand-accent/30 transition-colors group">
                <div className="relative flex items-center justify-center">
                  <input
                    type="checkbox"
                    className="peer sr-only"
                    checked={online}
                    onChange={(e) =>
                      setValue("onlinePaymentsEnabled", e.target.checked)
                    }
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
      </div>
    </div>
  );
}
