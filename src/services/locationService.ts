import { Location, WeatherInfo, DeviceInfo } from '@/interfaces/location';

// Mock service - Google Maps API 대신 사용
export class LocationService {
    private static readonly BASE_URL = "/api/location";

    static async getCurrentLocation(): Promise<Location> {
        try {
            const response = await fetch(`${LocationService.BASE_URL}`);
            if (!response.ok) {
                throw new Error("Failed to fetch current location");
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error("Error fetching current location:", error);
            throw error;
        }
    }
}