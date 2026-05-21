import { useQuery } from "@tanstack/react-query";
import { useCallback, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ROUTES } from "../constants/routes";
import { fetchMe, scanAttendance } from "../services/authApi";
import { useQrScanner, SCANNER_ELEMENT_ID } from "../hooks/useQrScanner";
import { Check, X, Camera } from "lucide-react";

type PageState = "idle" | "scanning" | "submitting" | "success" | "error";

interface ScanResult {
  ignored?: boolean;
}

function getPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation not available on this device"));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 15_000,
      maximumAge: 120_000,
    });
  });
}

function parseApiError(
  err: Error & { response?: { data?: { error?: { message?: string } } } },
): string {
  return (
    err.response?.data?.error?.message ??
    err.message ??
    "Network error. Please try again."
  );
}

export function MemberScanPage() {
  const [pageState, setPageState] = useState<PageState>("idle");
  const [message, setMessage] = useState("");
  const positionPromiseRef = useRef<Promise<GeolocationPosition> | null>(null);

  const meQuery = useQuery({ queryKey: ["me"], queryFn: fetchMe });
  const geoRequired = meQuery.data?.gym?.geoFencingEnabled !== false;

  const handleDetected = useCallback(async (rawValue: string) => {
    setPageState("submitting");
    setMessage("");
    try {
      let latitude: number | undefined;
      let longitude: number | undefined;
      if (geoRequired) {
        const pos = await (positionPromiseRef.current ?? getPosition());
        latitude = pos.coords.latitude;
        longitude = pos.coords.longitude;
      }
      const result = (await scanAttendance({
        token: rawValue.trim(),
        latitude,
        longitude,
      })) as ScanResult;

      if (result.ignored) {
        setMessage("Already recorded — duplicate scan ignored.");
      } else {
        setMessage("✓ Checked in successfully!");
      }
      setPageState("success");
    } catch (err) {
      setMessage(
        parseApiError(
          err as Error & {
            response?: { data?: { error?: { message?: string } } };
          },
        ),
      );
      setPageState("error");
    } finally {
      positionPromiseRef.current = null;
    }
  }, [geoRequired]);

  const { cameraState, cameraError, startCamera, stopCamera } = useQrScanner({
    onDetected: handleDetected,
  });

  const isScanning = cameraState === "scanning";
  const effectiveState: PageState =
    pageState === "submitting" ||
    pageState === "success" ||
    pageState === "error"
      ? pageState
      : cameraState === "scanning"
        ? "scanning"
        : cameraState === "error"
          ? "error"
          : pageState;

  const displayError = cameraState === "error" ? cameraError : message;

  async function handleStart() {
    setPageState("idle");
    setMessage("");
    positionPromiseRef.current = geoRequired ? getPosition() : null;
    await startCamera();
  }

  async function handleCancel() {
    await stopCamera();
    positionPromiseRef.current = null;
    setPageState("idle");
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-brand-bg relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] bg-brand-accent/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-sm space-y-8 relative z-10">
        <header className="text-center space-y-2">
          <h1 className="text-3xl font-black text-white">Scan QR Code</h1>
          <p className="text-brand-muted font-bold uppercase tracking-[0.2em] text-[10px]">
            Point camera at the gym's QR terminal
          </p>
        </header>

        {/* Camera container — div always stays in DOM so html5-qrcode never loses its ref */}
        <div className="relative rounded-2xl overflow-hidden border border-brand-accent/20 bg-black/60 backdrop-blur-sm shadow-[0_0_40px_rgba(0,0,0,0.5)]">
          {isScanning && <ScannerOverlay />}
          {/* html5-qrcode mounts here — always rendered, hidden when not scanning */}
          <div
            id={SCANNER_ELEMENT_ID}
            className={isScanning ? "block" : "hidden"}
            style={{ width: "100%" }}
          />
          {!isScanning && (
            <div className="flex flex-col items-center justify-center py-16 px-6 gap-4">
              {effectiveState === "submitting" && <Spinner />}
              {effectiveState === "success" && <SuccessIcon />}
              {effectiveState === "error" && <ErrorIcon />}
              {effectiveState === "idle" && <CameraIcon />}

              <StatusMessage
                state={effectiveState}
                message={displayError || message}
              />
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="space-y-3">
          {(effectiveState === "idle" ||
            effectiveState === "error" ||
            effectiveState === "success") && (
            <button
              id="btn-start-camera"
              onClick={handleStart}
              className="w-full h-12 rounded-xl bg-brand-accent text-brand-bg font-bold text-sm uppercase tracking-widest hover:brightness-110 active:scale-[0.98] transition-all"
            >
              {effectiveState === "error" || effectiveState === "success"
                ? "Scan Again"
                : "Start Camera"}
            </button>
          )}

          {isScanning && (
            <button
              id="btn-cancel-scan"
              onClick={handleCancel}
              className="w-full h-12 rounded-xl border border-brand-muted/30 text-brand-muted font-bold text-sm uppercase tracking-widest hover:border-brand-muted/60 active:scale-[0.98] transition-all"
            >
              Cancel
            </button>
          )}
        </div>

        <footer className="text-center pt-2">
          <Link
            className="text-xs font-bold uppercase tracking-widest text-brand-muted hover:text-brand-accent transition-colors"
            to={ROUTES.member}
            onClick={stopCamera}
          >
            ← Back
          </Link>
        </footer>
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function ScannerOverlay() {
  return (
    <div className="absolute inset-0 z-10 pointer-events-none">
      <div className="absolute top-6 left-6 w-8 h-8 border-t-2 border-l-2 border-brand-accent rounded-tl-lg" />
      <div className="absolute top-6 right-6 w-8 h-8 border-t-2 border-r-2 border-brand-accent rounded-tr-lg" />
      <div className="absolute bottom-6 left-6 w-8 h-8 border-b-2 border-l-2 border-brand-accent rounded-bl-lg" />
      <div className="absolute bottom-6 right-6 w-8 h-8 border-b-2 border-r-2 border-brand-accent rounded-br-lg" />
      <div className="absolute left-6 right-6 h-0.5 bg-brand-accent/70 animate-scan-line" />
    </div>
  );
}

function StatusMessage({
  state,
  message,
}: {
  state: PageState;
  message: string;
}) {
  if (state === "submitting")
    return <p className="text-brand-muted text-sm">Verifying attendance…</p>;
  if (state === "success")
    return (
      <p className="text-brand-accent font-bold text-center text-lg">
        {message}
      </p>
    );
  if (state === "error")
    return (
      <p className="text-red-400 font-medium text-center text-sm leading-relaxed">
        {message}
      </p>
    );
  return (
    <p className="text-brand-muted text-sm text-center">
      Tap <span className="text-brand-accent font-bold">Start Camera</span> to
      begin scanning.
    </p>
  );
}

function Spinner() {
  return (
    <div className="w-12 h-12 rounded-full border-2 border-brand-accent/30 border-t-brand-accent animate-spin" />
  );
}

function SuccessIcon() {
  return (
    <div className="w-16 h-16 rounded-full bg-brand-accent/10 border-2 border-brand-accent flex items-center justify-center">
      <Check className="w-8 h-8 text-brand-accent stroke-[3]" />
    </div>
  );
}

function ErrorIcon() {
  return (
    <div className="w-16 h-16 rounded-full bg-red-500/10 border-2 border-red-500 flex items-center justify-center">
      <X className="w-8 h-8 text-red-500 stroke-[3]" />
    </div>
  );
}

function CameraIcon() {
  return <Camera className="w-14 h-14 text-brand-accent/40 stroke-[1.5]" />;
}
