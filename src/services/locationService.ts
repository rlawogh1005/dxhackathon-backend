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

  static async searchLocation(query: string): Promise<Location[]> {
    // 실제 구현시 Google Places API 사용
    return 
  }
}