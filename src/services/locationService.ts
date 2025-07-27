import { Location, WeatherInfo, DeviceInfo } from '@/interfaces/location';

// Mock service - Google Maps API 대신 사용
export class LocationService {
  static async getCurrentLocation(): Promise<Location> {
    // 테스트를 위해 '서울역'의 가상 GPS 좌표를 반환합니다.
    return Promise.resolve({
      latitude: 37.5547, // 서울역 위도
      longitude: 126.9704, // 서울역 경도
      address: "가상 위치: 서울역",
      distance: "0km"
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