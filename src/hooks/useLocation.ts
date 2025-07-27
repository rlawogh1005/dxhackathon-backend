import { useState, useEffect } from 'react';
import { Location, WeatherInfo, DeviceInfo } from '@/interfaces/location';
import { LocationService } from '@/services/locationService';

export const useLocation = () => {
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLocationData = async () => {
    try {
      setLoading(true);
      const location = await LocationService.getCurrentLocation();
      
      setCurrentLocation(location);
      setError(null);
    } catch (err) {
      setError('위치 정보를 가져오는데 실패했습니다.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocationData();
  }, []);

  const searchLocation = async (query: string) => {
    try {
      const results = await LocationService.searchLocation(query);
      return results;
    } catch (err) {
      console.error('검색 실패:', err);
      return [];
    }
  };

  return {
    currentLocation,
    loading,
    error,
    refreshLocation: fetchLocationData,
    searchLocation
  };
};