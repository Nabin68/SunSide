import { useState, useEffect, useCallback } from 'react';
import { reverseGeocode } from '../services/api';

export const useGeolocation = () => {
  const [location, setLocation] = useState({
    lat: null,
    lon: null,
    address: '',
    loading: true,
    error: null,
    denied: false,
  });

  const fetchLocation = useCallback(() => {
    setLocation(prev => ({ ...prev, loading: true, error: null }));
    
    if (!navigator.geolocation) {
      setLocation(prev => ({ ...prev, loading: false, error: 'Geolocation not supported', denied: true }));
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    };

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const data = await reverseGeocode(latitude, longitude);
          setLocation({
            lat: latitude,
            lon: longitude,
            address: data.address,
            loading: false,
            error: null,
            denied: false,
          });
        } catch (err) {
          setLocation({
            lat: latitude,
            lon: longitude,
            address: '',
            loading: false,
            error: 'Could not resolve address',
            denied: false,
          });
        }
      },
      (err) => {
        setLocation(prev => ({ 
          ...prev, 
          loading: false, 
          error: err.message, 
          denied: err.code === 1 
        }));
      },
      options
    );
  }, []);

  useEffect(() => {
    fetchLocation();
  }, [fetchLocation]);

  return { ...location, refresh: fetchLocation };
};
