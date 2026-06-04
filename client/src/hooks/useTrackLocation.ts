import { useState, useCallback } from "react";

export type LocationType = {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
};

export type LocationStatus = "idle" | "loading" | "success" | "denied" | "error";

export const useTrackLocation = () => {
  const [location, setLocation] = useState<LocationType | null>(null);
  const [status, setStatus] = useState<LocationStatus>("idle");

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setStatus("error");
      return;
    }
    setStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
        });
        setStatus("success");
      },
      (error) => {
        console.error("Geolocation error:", error);
        if (error.code === error.PERMISSION_DENIED) {
          setStatus("denied");
        } else {
          setStatus("error");
        }
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }, []);

  return {
    location,
    status,
    loading: status === "loading",
    requestLocation,
  };
};
