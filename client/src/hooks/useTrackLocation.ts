import { useEffect, useState } from "react";

export type LocationType = {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
};

export const useTrackLocation = () => {
  const [location, setLocation] = useState<LocationType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
          });
          setLoading(false);
        },
        (error) => {
          console.error(error);
          setLoading(false);
        },
      );
    }
  }, []);

  return { location, loading };
};
