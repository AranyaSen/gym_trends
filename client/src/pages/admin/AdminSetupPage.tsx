import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ROUTES } from "../../constants/routes";
import {
  completeGymSetup,
  fetchMyGym,
} from "../../services/auth/auth.services";
import { Button } from "../../components/ui/Button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { GymLocationPicker } from "../../components/ui/GymLocationPicker";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { gymSetupSchema, type GymSetupFormValues } from "../../schemas/gym";
import { useTrackLocation } from "../../hooks/useTrackLocation";
import { Loader2, MapPin, Map, ChevronRight, Check } from "lucide-react";

function AdminSetupPage() {
  const nav = useNavigate();
  const q = useQuery({ queryKey: ["gym"], queryFn: fetchMyGym });
  const [err, setErr] = useState<string | null>(null);
  const [showMap, setShowMap] = useState(false);

  const { location, status, loading, requestLocation } = useTrackLocation();

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
      latitude: 0,
      longitude: 0,
      gracePeriodDays: "0",
      onlinePaymentsEnabled: false,
    },
  });

  const lat = watch("latitude");
  const lng = watch("longitude");
  const online = watch("onlinePaymentsEnabled");
  const hasLocation = lat !== 0 && lng !== 0;

  useEffect(() => {
    if (location && status === "success") {
      setShowMap(true);
    }
  }, [location, status]);

  const m = useMutation({
    mutationFn: (values: GymSetupFormValues) =>
      completeGymSetup({
        name: values.name,
        latitude: values.latitude,
        longitude: values.longitude,
        gracePeriodDays: Number(values.gracePeriodDays),
        onlinePaymentsEnabled: values.onlinePaymentsEnabled || false,
      }),
    onSuccess: () => nav(ROUTES.ADMIN, { replace: true }),
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
      nav(ROUTES.ADMIN, { replace: true });
    }
  }, [gym?.setupCompleted, nav]);

  const onSubmit = (values: GymSetupFormValues) => {
    setErr(null);
    m.mutate(values);
  };

  const handleLocationButtonClick = () => {
    if (hasLocation) {
      // Already have coordinates — just reopen the map
      setShowMap(true);
    } else {
      // Ask browser for permission + fetch GPS
      requestLocation();
    }
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

  return (
    <>
      {/* Map picker modal */}
      {showMap && (
        <GymLocationPicker
          initialLat={lat !== 0 ? lat : location?.latitude || 0}
          initialLng={lng !== 0 ? lng : location?.longitude || 0}
          onConfirm={(newLat, newLng) => {
            setValue("latitude", newLat, { shouldValidate: true });
            setValue("longitude", newLng, { shouldValidate: true });
          }}
          onClose={() => setShowMap(false)}
        />
      )}

      <div className="min-h-fit flex items-center justify-center p-6 bg-brand-bg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-brand-accent/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-brand-accent/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="w-full max-w-md space-y-8 relative z-10">
          <header className="text-center space-y-2">
            <Link
              to={ROUTES.HOME}
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

                {/* ── Gym Location Button ─────────────────────────────── */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-brand-muted">
                    Gym Location
                  </label>

                  <button
                    type="button"
                    id="gym-location-btn"
                    onClick={handleLocationButtonClick}
                    disabled={loading}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 rounded-lg border transition-all group
                      ${
                        hasLocation
                          ? "border-brand-accent/40 bg-brand-accent/5 hover:bg-brand-accent/10"
                          : "border-brand-border/30 bg-brand-surface/30 hover:border-brand-accent/30"
                      }
                      disabled:opacity-60 disabled:cursor-not-allowed
                    `}
                  >
                    {/* Icon */}
                    <span
                      className={`transition-transform group-hover:scale-110 ${hasLocation ? "text-brand-accent" : "text-brand-muted"}`}
                    >
                      {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : hasLocation ? (
                        <MapPin className="w-5 h-5" />
                      ) : (
                        <Map className="w-5 h-5" />
                      )}
                    </span>

                    <div className="flex-1 text-left">
                      <p
                        className={`text-xs font-bold uppercase tracking-wider ${hasLocation ? "text-brand-accent" : "text-slate-300"}`}
                      >
                        {loading
                          ? "Fetching location…"
                          : hasLocation
                            ? "Location set — tap to adjust"
                            : "Set Gym Location"}
                      </p>
                      {hasLocation ? (
                        <p className="text-[10px] font-mono text-brand-muted mt-0.5">
                          {lat.toFixed(5)}, {lng.toFixed(5)}
                        </p>
                      ) : (
                        <p className="text-[10px] text-brand-muted mt-0.5">
                          {status === "denied"
                            ? "Location access denied — open map manually"
                            : "Uses GPS to pin your gym on the map"}
                        </p>
                      )}
                    </div>

                    {/* Arrow / open-map icon */}
                    {!loading && (
                      <ChevronRight
                        className={`w-4 h-4 flex-shrink-0 transition-colors ${hasLocation ? "text-brand-accent" : "text-brand-muted group-hover:text-slate-200"}`}
                      />
                    )}
                  </button>

                  {/* Show map manually when location was denied */}
                  {status === "denied" && !hasLocation && (
                    <button
                      type="button"
                      onClick={() => setShowMap(true)}
                      className="text-[10px] font-bold text-brand-accent/70 hover:text-brand-accent underline underline-offset-2 transition-colors"
                    >
                      Location access denied click to open map and place pin
                      manually
                    </button>
                  )}

                  {/* Validation error */}
                  {(errors.latitude || errors.longitude) && (
                    <p className="text-[10px] text-red-400 font-bold">
                      {errors.latitude?.message || errors.longitude?.message}
                    </p>
                  )}
                </div>
                {/* ─────────────────────────────────────────────────────── */}

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
                    <div className="w-5 h-5 border-2 border-brand-border rounded peer-checked:border-brand-accent peer-checked:bg-brand-accent transition-all flex items-center justify-center">
                      <Check className="w-3 h-3 text-brand-bg opacity-0 peer-checked:opacity-100 transition-opacity stroke-[3]" />
                    </div>
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
    </>
  );
}

export default AdminSetupPage;
