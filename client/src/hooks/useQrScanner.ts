import { Html5Qrcode, type CameraDevice } from "html5-qrcode";
import { useEffect, useRef, useState } from "react";

export type CameraScanState = "idle" | "scanning" | "error";

export const SCANNER_ELEMENT_ID = "qr-reader-viewfinder";

const SCANNER_CONFIG = { fps: 12, qrbox: { width: 260, height: 260 } } as const;

interface UseQrScannerOptions {
  /** Called once when a QR value is successfully decoded. Hook stops camera before calling. */
  onDetected: (rawValue: string) => void;
}

interface UseQrScannerReturn {
  cameraState: CameraScanState;
  cameraError: string;
  startCamera: () => Promise<void>;
  stopCamera: () => Promise<void>;
}

const REAR_LABEL = /back|rear|main|primary|environment|facing back/i;
const FRONT_LABEL = /front|selfie|user|facing front/i;
/** Samsung ultrawide is often "camera2 0, facing back" with no "ultra"/"wide" in the label. */
const SPECIALTY_LENS =
  /ultra|\bwide\b|0\.[567]|tele|zoom|macro|depth|camera2\s*0|, 0,\s*facing/i;

function camera2Index(label: string): number | null {
  const m = label.match(/camera2\s+(\d+)/i);
  return m ? parseInt(m[1], 10) : null;
}

async function enumerateVideoDevices(): Promise<CameraDevice[]> {
  const inputs = await navigator.mediaDevices.enumerateDevices();
  return inputs
    .filter((d) => d.kind === "videoinput" && d.deviceId)
    .map((d) => ({ id: d.deviceId, label: d.label ?? "" }));
}

/** Pick main rear lens; on Samsung prefers highest camera2 index (0 = ultrawide). */
function pickFromLabeledDevices(devices: CameraDevice[]): CameraDevice | null {
  const rear = devices.filter(
    (d) => REAR_LABEL.test(d.label) && !FRONT_LABEL.test(d.label),
  );
  const pool = rear.length
    ? rear
    : devices.filter((d) => !FRONT_LABEL.test(d.label));

  if (!pool.length) return null;

  const withoutSpecialty = pool.filter((d) => !SPECIALTY_LENS.test(d.label));
  const candidates = withoutSpecialty.length ? withoutSpecialty : pool;

  const indexed = candidates
    .map((d) => ({ d, idx: camera2Index(d.label) }))
    .filter((x): x is { d: CameraDevice; idx: number } => x.idx !== null);
  if (indexed.length) {
    // Samsung: 0 = ultrawide, 2/3 = main rear, higher = tele — prefer main, not max index.
    for (const preferredIdx of [3, 2, 1]) {
      const hit = indexed.find((x) => x.idx === preferredIdx);
      if (hit) return hit.d;
    }
    const nonUltrawide = indexed
      .filter((x) => x.idx !== 0)
      .sort((a, b) => b.idx - a.idx);
    if (nonUltrawide.length) return nonUltrawide[0].d;
    return indexed.sort((a, b) => b.idx - a.idx)[0].d;
  }

  const byMainKeyword = candidates.find((d) => /main|primary/i.test(d.label));
  return byMainKeyword ?? candidates[candidates.length - 1];
}

/** Returns the best rear camera: prefers back cameras and filters out ultrawide/telephoto lenses. */
async function pickBestCamera(): Promise<
  { deviceId: { exact: string } } | { facingMode: string }
> {
  let permStream: MediaStream | null = null;
  try {
    permStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" },
    });
  } catch {
    return { facingMode: "environment" };
  }

  let devices: CameraDevice[] = [];
  try {
    devices = await enumerateVideoDevices();
    if (!devices.length) devices = await Html5Qrcode.getCameras();
  } catch {
    permStream?.getTracks().forEach((t) => t.stop());
    return { facingMode: "environment" };
  } finally {
    permStream?.getTracks().forEach((t) => t.stop());
  }

  if (!devices.length) return { facingMode: "environment" };

  const hasLabels = devices.some((d) => d.label.trim().length > 0);
  if (hasLabels) {
    const preferred = pickFromLabeledDevices(devices);
    return preferred
      ? { deviceId: { exact: preferred.id } }
      : { facingMode: "environment" };
  }

  // No labels: prefer last videoinput (often main rear; index 0 is often ultrawide).
  if (devices.length >= 2) {
    return { deviceId: { exact: devices[devices.length - 1].id } };
  }
  return { deviceId: { exact: devices[0].id } };
}

export function useQrScanner({
  onDetected,
}: UseQrScannerOptions): UseQrScannerReturn {
  const [cameraState, setCameraState] = useState<CameraScanState>("idle");
  const [cameraError, setCameraError] = useState("");

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const firedRef = useRef(false);
  /** Keep latest callback without recreating the scanner. */
  const onDetectedRef = useRef(onDetected);
  onDetectedRef.current = onDetected;

  const stopCamera = async (): Promise<void> => {
    const s = scannerRef.current;
    if (!s) {
      setCameraState("idle");
      return;
    }
    try {
      if (s.isScanning) await s.stop();
    } catch {
      /* already stopped – ignore */
    }
    scannerRef.current = null;
    setCameraState("idle");
  };

  const startCamera = async (): Promise<void> => {
    firedRef.current = false;
    setCameraError("");
    setCameraState("scanning");

    const constraint = await pickBestCamera();
    const scanner = new Html5Qrcode(SCANNER_ELEMENT_ID);
    scannerRef.current = scanner;

    try {
      await scanner.start(
        constraint,
        SCANNER_CONFIG,
        async (decoded) => {
          if (firedRef.current) return;
          firedRef.current = true;
          await stopCamera();
          onDetectedRef.current(decoded);
        },
        () => {
          /* per-frame "not found" — suppress */
        },
      );
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Camera could not be started";
      setCameraError(
        msg.includes("Permission")
          ? "Camera permission denied. Please allow access and retry."
          : msg,
      );
      setCameraState("error");
    }
  };

  /* Cleanup on unmount */
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return { cameraState, cameraError, startCamera, stopCamera };
}
