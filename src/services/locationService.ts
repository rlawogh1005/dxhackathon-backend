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

    static async getCurrentLocation(deviceId: string): Promise<Location> {
        try {
            const response = await fetch(`${LocationService.DEVICES_URL}/${deviceId}`);
            if (!response.ok) {
                throw new Error(`Failed to fetch current location: ${response.status} ${response.statusText}`);
            }
            return response.json();
        } catch (error) {
            console.error("Error fetching current location:", error);
            throw error;
        }
    }
}