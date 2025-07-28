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

export interface Device {
  id: number;
  deviceId: string;
  name?: string; // 기기 이름 등 추가 속성이 있을 수 있습니다.
  role: 'guardian' | 'oldman';
  createdAt: string;
  updatedAt: string;
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