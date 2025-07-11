import { Location } from '@/interfaces/location';
import { MapPin, Power } from 'lucide-react';

interface LocationInfoProps {
  location: Location | null;
  address: string;
}

export const LocationInfo = ({ location, address }: LocationInfoProps) => {
  return (
    <div className="absolute bottom-4 right-4 space-y-3">
      {/* Location Card */}
      <div className="bg-glass backdrop-blur-xl border border-glass-border rounded-2xl p-4 w-80">
        <div className="flex items-start space-x-3">
          <MapPin className="h-5 w-5 text-primary mt-1" />
          <div className="flex-1">
            <h3 className="font-medium text-foreground">{address}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              새부정로 설명하는 UI
            </p>
            <div className="flex items-center space-x-4 mt-3 text-sm text-muted-foreground">
              <span>📍 {location?.distance || '5.3km'}</span>
              <span>⚡ 장치 배터리 100%</span>
            </div>
            <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
              <span>🔗 ###</span>
              <span>🕐 도보 12 min</span>
            </div>
          </div>
        </div>
      </div>

      {/* Status Labels */}
      <div className="space-y-2">
        <div className="bg-accent/20 backdrop-blur-sm border border-accent/30 rounded-lg px-4 py-2">
          <span className="text-sm font-medium text-accent-foreground">보호자 위치 보기</span>
        </div>
        
        <div className="bg-accent/20 backdrop-blur-sm border border-accent/30 rounded-lg px-4 py-2">
          <span className="text-sm font-medium text-accent-foreground">장치 온 오프 상태</span>
        </div>
      </div>

      {/* Navigation Button */}
      <div className="bg-primary rounded-2xl p-4">
        <button className="w-full text-primary-foreground font-semibold text-lg">
          안내 시작
        </button>
      </div>
    </div>
  );
};