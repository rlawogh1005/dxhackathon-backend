import { Location, Device } from '@/interfaces/location';

export class LocationService {
    private static readonly DEVICES_URL = "http://localhost:3000/device";

    static async getAllDevices(): Promise<Device[]> {
        try {
            const response = await fetch(LocationService.DEVICES_URL);
            if (!response.ok) {
                throw new Error(`Failed to fetch devices: ${response.status} ${response.statusText}`);
            }
            return response.json();
        } catch (error) {
            console.error("Error fetching all devices:", error);
            throw error;
        }
    }

    static async getCurrentLocation(deviceId: string): Promise<Location | null> {
        try {
            const response = await fetch(`${LocationService.DEVICES_URL}/${deviceId}`);
            if (!response.ok) {
                throw new Error(`Failed to fetch current location: ${response.status} ${response.statusText}`);
            }
            const data = await response.json();
            
            // API가 device 객체와 함께 latestLocation을 반환하는 것으로 보입니다.
            // latestLocation이 있고, 내부에 주소 정보가 있을 때만 위치 정보를 반환합니다.
            if (data && data.latestLocation && data.latestLocation.address) {
                return data.latestLocation;
            }
            
            return null;
        } catch (error) {
            console.error("Error fetching current location:", error);
            throw error;
        }
    }
}