"use client";

import { useState, useEffect } from 'react';

interface Location {
  latitude: number;
  longitude: number;
  accuracy: number;
}

interface UseGeolocationResult {
  location: Location | null;
  loading: boolean;
  error: string | null;
  requestLocation: () => void;
  hasPermission: boolean;
}

export function useGeolocation(): UseGeolocationResult {
  const [location, setLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState(false);

  // Check if location is stored in localStorage
  useEffect(() => {
    const stored = localStorage.getItem('userLocation');
    if (stored) {
      try {
        setLocation(JSON.parse(stored));
        setHasPermission(true);
      } catch (e) {
        // Ignore parse errors
      }
    }
  }, []);

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        };
        
        setLocation(newLocation);
        setHasPermission(true);
        setLoading(false);
        
        // Store in localStorage for future sessions
        localStorage.setItem('userLocation', JSON.stringify(newLocation));
      },
      (err) => {
        setLoading(false);
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setError('Location permission denied. Please enable location access or enter your location manually.');
            break;
          case err.POSITION_UNAVAILABLE:
            setError('Location information is unavailable.');
            break;
          case err.TIMEOUT:
            setError('Location request timed out.');
            break;
          default:
            setError('An unknown error occurred.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      }
    );
  };

  return { location, loading, error, requestLocation, hasPermission };
}