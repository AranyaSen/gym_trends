import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  updateGymSettings,
  fetchMyGym,
  type GymRecord,
} from "../../services/auth/auth.services";
import { useTrackLocation } from "../../hooks/useTrackLocation";
import {
  Check,
  ChevronRight,
  Loader2,
  Map,
  MapPin,
  Shield,
  CreditCard,
} from "lucide-react";
import { GymLocationPicker } from "../../components/ui/GymLocationPicker";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";

function SettingsToggle({
  id,
  label,
  description,
  checked,
  disabled,
  onChange,
}: {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label
      htmlFor={id}
      className="flex items-start gap-3 p-4 rounded-xl border border-brand-border/30 bg-brand-bg/50 hover:border-brand-accent/20 transition-colors cursor-pointer group"
    >
      <div className="relative flex items-center justify-center mt-0.5">
        <input
          id={id}
          type="checkbox"
          className="peer sr-only"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
        />
        <div className="w-5 h-5 border-2 border-brand-border rounded peer-checked:border-brand-accent peer-checked:bg-brand-accent peer-disabled:opacity-50 transition-all flex items-center justify-center">
          <Check className="w-3 h-3 text-brand-bg opacity-0 peer-checked:opacity-100 transition-opacity stroke-[3]" />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-200 group-hover:text-white transition-colors">
          {label}
        </span>
        <p className="text-[10px] text-brand-muted mt-1 leading-relaxed">
          {description}
        </p>
      </div>
    </label>
  );
}

function AdminPreferencesPage({ gym: propGym }: { gym?: GymRecord }) {
  const qc = useQueryClient();
  const gq = useQuery({
    queryKey: ["gym"],
    queryFn: fetchMyGym,
    enabled: !propGym,
  });

  const gym = propGym || gq.data;

  const [err, setErr] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [draftLat, setDraftLat] = useState(gym?.latitude ?? 0);
  const [draftLng, setDraftLng] = useState(gym?.longitude ?? 0);
  const [locationDirty, setLocationDirty] = useState(false);

  const { location, status, loading, requestLocation } = useTrackLocation();

  const hasValidLocation = draftLat !== 0 && draftLng !== 0;

  useEffect(() => {
    if (gym) {
      setDraftLat(gym.latitude);
      setDraftLng(gym.longitude);
      setLocationDirty(false);
    }
  }, [gym?.latitude, gym?.longitude]);

  useEffect(() => {
    if (location && status === "success" && !hasValidLocation) {
      setShowMap(true);
    }
  }, [location, status, hasValidLocation]);

  const settingsMutation = useMutation({
    mutationFn: updateGymSettings,
    onSuccess: (updated) => {
      qc.setQueryData(["gym"], updated);
      setErr(null);
      setSaved("Preferences saved");
      window.setTimeout(() => setSaved(null), 2500);
    },
    onError: (e: unknown) => {
      const msg =
        e && typeof e === "object" && "response" in e
          ? String(
              (e as { response?: { data?: { error?: { message?: string } } } })
                .response?.data?.error?.message,
            )
          : "Could not save settings";
      setErr(msg || "Could not save settings");
      setSaved(null);
    },
  });

  const locationMutation = useMutation({
    mutationFn: () =>
      updateGymSettings({ latitude: draftLat, longitude: draftLng }),
    onSuccess: (updated) => {
      qc.setQueryData(["gym"], updated);
      setLocationDirty(false);
      setErr(null);
      setSaved("Gym location updated");
      window.setTimeout(() => setSaved(null), 2500);
    },
    onError: (e: unknown) => {
      const msg =
        e && typeof e === "object" && "response" in e
          ? String(
              (e as { response?: { data?: { error?: { message?: string } } } })
                .response?.data?.error?.message,
            )
          : "Could not update location";
      setErr(msg || "Could not update location");
    },
  });

  const busy = settingsMutation.isPending || locationMutation.isPending;

  function handleOnlinePayments(enabled: boolean) {
    setSaved(null);
    settingsMutation.mutate({ onlinePaymentsEnabled: enabled });
  }

  function handleGeoFencing(enabled: boolean) {
    setSaved(null);
    settingsMutation.mutate({ geoFencingEnabled: enabled });
  }

  function handleLocationButtonClick() {
    if (hasValidLocation) {
      setShowMap(true);
    } else {
      requestLocation();
    }
  }

  if (!gym) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-brand-accent"></div>
      </div>
    );
  }

  return (
    <>
      {showMap && (
        <GymLocationPicker
          initialLat={draftLat !== 0 ? draftLat : (location?.latitude ?? 0)}
          initialLng={draftLng !== 0 ? draftLng : (location?.longitude ?? 0)}
          onConfirm={(newLat, newLng) => {
            setDraftLat(newLat);
            setDraftLng(newLng);
            setLocationDirty(true);
          }}
          onClose={() => setShowMap(false)}
        />
      )}

      <Card className="neon-border">
        <CardHeader>
          <CardTitle>Gym Preferences</CardTitle>
          <p className="text-[10px] text-brand-muted font-medium uppercase tracking-widest mt-1">
            Payments, geo-fencing, and location — update anytime
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-brand-muted">
              <CreditCard className="w-4 h-4 text-brand-accent" />
              <span className="text-[10px] font-black uppercase tracking-widest">
                Payments
              </span>
            </div>
            <SettingsToggle
              id="toggle-online-payments"
              label="Online payments (Razorpay)"
              description="When enabled, members can pay membership fees online. When disabled, only offline payment requests are available."
              checked={gym.onlinePaymentsEnabled}
              disabled={busy}
              onChange={handleOnlinePayments}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-brand-muted">
              <Shield className="w-4 h-4 text-brand-accent" />
              <span className="text-[10px] font-black uppercase tracking-widest">
                Entry check-in
              </span>
            </div>
            <SettingsToggle
              id="toggle-geo-fencing"
              label="Geo-fencing for QR scan"
              description="When enabled, members must be within range of the gym to check in via QR. When disabled, location is not verified at entry."
              checked={gym.geoFencingEnabled}
              disabled={busy}
              onChange={handleGeoFencing}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-brand-muted">
              <MapPin className="w-4 h-4 text-brand-accent" />
              <span className="text-[10px] font-black uppercase tracking-widest">
                Gym location
              </span>
            </div>
            <p className="text-[10px] text-brand-muted leading-relaxed">
              Used for geo-fencing when enabled. Update if your gym has moved or
              the pin was placed incorrectly.
            </p>

            <button
              type="button"
              onClick={handleLocationButtonClick}
              disabled={loading}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-lg border transition-all group
                ${
                  hasValidLocation
                    ? "border-brand-accent/40 bg-brand-accent/5 hover:bg-brand-accent/10"
                    : "border-brand-border/30 bg-brand-surface/30 hover:border-brand-accent/30"
                }
                disabled:opacity-60 disabled:cursor-not-allowed
              `}
            >
              <span
                className={`transition-transform group-hover:scale-110 ${hasValidLocation ? "text-brand-accent" : "text-brand-muted"}`}
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : hasValidLocation ? (
                  <MapPin className="w-5 h-5" />
                ) : (
                  <Map className="w-5 h-5" />
                )}
              </span>
              <div className="flex-1 text-left">
                <p
                  className={`text-xs font-bold uppercase tracking-wider ${hasValidLocation ? "text-brand-accent" : "text-slate-300"}`}
                >
                  {loading
                    ? "Fetching location…"
                    : hasValidLocation
                      ? "Update gym location on map"
                      : "Set gym location"}
                </p>
                {hasValidLocation && (
                  <p className="text-[10px] font-mono text-brand-muted mt-0.5">
                    {draftLat.toFixed(5)}, {draftLng.toFixed(5)}
                    {locationDirty ? " (unsaved)" : ""}
                  </p>
                )}
              </div>
              {!loading && (
                <ChevronRight
                  className={`w-4 h-4 flex-shrink-0 ${hasValidLocation ? "text-brand-accent" : "text-brand-muted"}`}
                />
              )}
            </button>

            {status === "denied" && !hasValidLocation && (
              <button
                type="button"
                onClick={() => setShowMap(true)}
                className="text-[10px] font-bold text-brand-accent/70 hover:text-brand-accent underline underline-offset-2"
              >
                Open map to place pin manually
              </button>
            )}

            {locationDirty && (
              <Button
                type="button"
                className="w-full"
                disabled={locationMutation.isPending || !hasValidLocation}
                onClick={() => locationMutation.mutate()}
              >
                {locationMutation.isPending
                  ? "Saving location…"
                  : "Save location"}
              </Button>
            )}
          </div>

          {saved && (
            <p className="text-[10px] font-bold uppercase tracking-wider text-brand-accent text-center">
              {saved}
            </p>
          )}
          {err && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-bold uppercase tracking-wider text-center">
              {err}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}

export default AdminPreferencesPage;
