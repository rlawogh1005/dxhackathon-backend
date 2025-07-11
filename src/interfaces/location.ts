export interface Location {
  latitude: number;
  longitude: number;
  address: string;
  distance?: string;
}

export interface WeatherInfo {
  temperature: number;
  location: string;
  country: string;
  condition?: string;
}

export interface DeviceInfo {
  batteryLevel: number;
  isCharging: boolean;
  lastUpdate: string;
}

export interface ReportData {
  id: string;
  type: 'missing' | 'found' | 'emergency';
  timestamp: Date;
  location: Location;
  description?: string;
}

export interface NavigationItem {
  id: string;
  title: string;
  icon: string;
  path: string;
}