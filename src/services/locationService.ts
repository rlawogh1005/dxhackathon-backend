import { Location, WeatherInfo, DeviceInfo } from '@/interfaces/location';

// Mock service - Google Maps API 대신 사용
export class LocationService {
    private static readonly BASE_URL = "/api/location";

    static async getCurrentLocation(): Promise<Location> {
        // try {
        //     const response = await fetch(`${LocationService.BASE_URL}`);
        //     if (!response.ok) {
        //         throw new Error("Failed to fetch current location");
        //     }
        //     const data = await response.json();
        //     return data;
        // } catch (error) {
        //     console.error("Error fetching current location:", error);
        //     throw error;
        // }
        return Promise.resolve({
            latitude: 37.5547, // 서울역 위도
            longitude: 126.9704, // 서울역 경도
            address: "가상 위치: 서울역",
            distance: "0km"
        });
    }
}