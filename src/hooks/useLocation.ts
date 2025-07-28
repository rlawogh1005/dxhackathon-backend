import { useState, useEffect, useCallback } from 'react';
import { Location, WeatherInfo, DeviceInfo } from '@/interfaces/location';
import { LocationService } from '@/services/locationService';

export const useLocation = (deviceId: string | null) => {
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLocationData = useCallback(async () => {
    if (!deviceId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const location = await LocationService.getCurrentLocation(deviceId);

      setCurrentLocation(location);
      setError(null);
    } catch (err) {
      setError('위치 정보를 가져오는데 실패했습니다.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [deviceId]);

  useEffect(() => {
    fetchLocationData();
  }, [fetchLocationData]);

  return {
    currentLocation,
    loading,
    error,
    refreshLocation: fetchLocationData,
  };
};