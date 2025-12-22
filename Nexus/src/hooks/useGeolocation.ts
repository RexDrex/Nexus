import { useState, useCallback } from 'react';

interface Coordinates {
  latitude: number;
  longitude: number;
  accuracy: number;
}

export const useGeolocation = () => {
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getCurrentPosition = useCallback(() => {
    return new Promise<Coordinates>((resolve, reject) => {
      if (!navigator.geolocation) {
        const err = 'Geolocation is not supported by your browser';
        setError(err);
        reject(new Error(err));
        return;
      }

      setLoading(true);
      setError(null);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          };
          setCoordinates(coords);
          setLoading(false);
          resolve(coords);
        },
        (err) => {
          let message = 'Failed to get location';
          switch (err.code) {
            case err.PERMISSION_DENIED:
              message = 'Location permission denied';
              break;
            case err.POSITION_UNAVAILABLE:
              message = 'Location information unavailable';
              break;
            case err.TIMEOUT:
              message = 'Location request timed out';
              break;
          }
          setError(message);
          setLoading(false);
          reject(new Error(message));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        }
      );
    });
  }, []);

  return { coordinates, loading, error, getCurrentPosition };
};
