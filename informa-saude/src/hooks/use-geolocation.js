import { useCallback, useState } from "react";

export function useGeolocation() {
  const [status, setStatus] = useState("idle");
  const [position, setPosition] = useState(null);

  const request = useCallback(() => {
    if (!navigator.geolocation) {
      setStatus("unsupported");
      return;
    }

    setStatus("loading");

    navigator.geolocation.getCurrentPosition(
      (result) => {
        setPosition({
          lat: result.coords.latitude,
          lng: result.coords.longitude,
        });

        setStatus("ok");
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setStatus("denied");
            break;

          case error.TIMEOUT:
            setStatus("timeout");
            break;

          default:
            setStatus("unavailable");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 60000,
      }
    );
  }, []);

  return {
    status,
    position,
    request,
  };
}