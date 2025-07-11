import { Location, WeatherInfo, DeviceInfo } from '@/interfaces/location';

// Mock service - Google Maps API 대신 사용
export class LocationService {
  static async getCurrentLocation(): Promise<Location> {
    // 실제 구현시 Google Maps Geolocation API 사용
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          latitude: 36.5184,
          longitude: 127.2043,
          address: "세종특별시 조치원읍 으뜩길 215",
          distance: "5.3km"
        });
      }, 1000);
    });
  }

  static async getWeatherInfo(location: Location): Promise<WeatherInfo> {
    // 실제 구현시 날씨 API 사용
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          temperature: 24,
          location: "세종시",
          country: "대한민국",
          condition: "맑음"
        });
      }, 500);
    });
  }

  static async getDeviceInfo(): Promise<DeviceInfo> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          batteryLevel: 100,
          isCharging: false,
          lastUpdate: new Date().toISOString()
        });
      }, 300);
    });
  }

  static async searchLocation(query: string): Promise<Location[]> {
    // 실제 구현시 Google Places API 사용
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            latitude: 36.5184,
            longitude: 127.2043,
            address: query + " 검색 결과",
          }
        ]);
      }, 800);
    });
  }
}