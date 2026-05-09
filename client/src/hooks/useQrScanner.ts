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

/** Returns the best rear camera: "back" label without "ultra" / "wide". */
async function pickBestCamera(): Promise<{ deviceId: { exact: string } } | { facingMode: string }> {
  let devices: CameraDevice[] = [];
  try {
    devices = await Html5Qrcode.getCameras();
  } catch {
    return { facingMode: "environment" };
  }

  if (!devices.length) return { facingMode: "environment" };

  const preferred =
    devices.find(
      (d) => /back|rear/i.test(d.label) && !/ultra|wide|0\.6/i.test(d.label)
    ) ??
    devices.find((d) => /back|rear/i.test(d.label)) ??
    devices[devices.length - 1];

  return preferred ? { deviceId: { exact: preferred.id } } : { facingMode: "environment" };
}

export function useQrScanner({ onDetected }: UseQrScannerOptions): UseQrScannerReturn {
  const [cameraState, setCameraState] = useState<CameraScanState>("idle");
  const [cameraError, setCameraError] = useState("");

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const firedRef = useRef(false);
  /** Keep latest callback without recreating the scanner. */
  const onDetectedRef = useRef(onDetected);
  onDetectedRef.current = onDetected;

  const stopCamera = async (): Promise<void> => {
    const s = scannerRef.current;
    if (!s) return;
    try {
      if (s.isScanning) await s.stop();
    } catch {
      /* already stopped – ignore */
    }
    scannerRef.current = null;
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
        }
      );
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Camera could not be started";
      setCameraError(
        msg.includes("Permission")
          ? "Camera permission denied. Please allow access and retry."
          : msg
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
