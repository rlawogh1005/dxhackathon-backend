import { Location } from '@/interfaces/location';
import { MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LocationInfoProps {
  location: Location | null;
  address: string;
}

export const LocationInfo = ({ location, address }: LocationInfoProps) => {
  return (
    <>
      {/* Location Card */}
      <div className="absolute bottom-20 right-4 bg-glass/95 backdrop-blur-xl border border-glass-border rounded-2xl p-6 w-96 shadow-xl">
        <div className="flex items-start space-x-3">
          <MapPin className="h-5 w-5 text-primary mt-1" />
          <div className="flex-1">
            <h3 className="font-semibold text-foreground mb-2">{address}</h3>
            <p className="text-sm text-muted-foreground mb-4">
              새부정로 설명하는 UI
            </p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center space-x-2 text-muted-foreground">
                <span>⚡</span>
                <span>장치 배터리 100%</span>
              </div>
              <div className="flex items-center space-x-2 text-muted-foreground">
                <span>📍</span>
                <span>{location?.distance || '5.3km'}</span>
              </div>
              <div className="flex items-center space-x-2 text-muted-foreground">
                <span>🔗</span>
                <span>###</span>
              </div>
              <div className="flex items-center space-x-2 text-muted-foreground">
                <span>🕐</span>
                <span>도보 12 min</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Button */}
      <div className="absolute bottom-4 right-4">
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-lg px-12 py-4 rounded-2xl shadow-xl w-96">
          안내 시작
        </Button>
      </div>
    </>
  );
};