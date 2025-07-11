import { WeatherInfo, DeviceInfo } from '@/interfaces/location';
import { Battery, Zap } from 'lucide-react';

interface WeatherCardProps {
  weatherInfo: WeatherInfo | null;
  deviceInfo: DeviceInfo | null;
}

export const WeatherCard = ({ weatherInfo, deviceInfo }: WeatherCardProps) => {
  if (!weatherInfo) return null;

  return (
    <div className="absolute bottom-4 left-4 bg-glass backdrop-blur-xl border border-glass-border rounded-2xl p-6 w-80">
      <div className="flex items-center justify-between">
        {/* Temperature */}
        <div className="flex flex-col">
          <span className="text-6xl font-light text-foreground">
            {weatherInfo.temperature}
          </span>
          <span className="text-2xl text-muted-foreground">°C</span>
          <div className="mt-2">
            <p className="text-sm text-muted-foreground">{weatherInfo.country}, {weatherInfo.location}</p>
          </div>
        </div>

        {/* Device Info */}
        <div className="flex flex-col items-end space-y-2">
          {deviceInfo && (
            <div className="flex items-center space-x-1 text-sm text-muted-foreground">
              <Zap className="h-4 w-4" />
              <span>장치 배터리 {deviceInfo.batteryLevel}%</span>
            </div>
          )}
          
          <div className="text-xs text-muted-foreground">###</div>
          <div className="text-xs text-muted-foreground">5.3km</div>
          <div className="text-xs text-muted-foreground">도보 12 min</div>
        </div>
      </div>
    </div>
  );
};