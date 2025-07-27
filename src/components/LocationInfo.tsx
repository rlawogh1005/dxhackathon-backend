import { Location } from '@/interfaces/location';
import { MapPin, Zap, CircleHelp, Footprints } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LocationInfoProps {
  location: Location | null;
  address: string;
  className?: string;
}

export const LocationInfo = ({ location, address, className }: LocationInfoProps) => {
  return (
    <div className={`bg-black bg-opacity-25 backdrop-blur-lg border border-white border-opacity-20 rounded-2xl p-4 text-white ${className}`}>
      <div className="flex justify-between items-center h-full">
        <div>
          <h3 className="font-semibold">{address}</h3>
          <p>|</p>
          <Button variant="secondary" className="mt-2 h-8 rounded-full bg-gray-700 hover:bg-gray-600 text-white">
            <MapPin className="h-4 w-4 mr-2" />
            5.3km
          </Button>
        </div>
        <div className="text-sm space-y-2 text-right">
          <div className="flex items-center justify-end">
            <Zap className="h-4 w-4 mr-2" />
            <span></span>
          </div>
          <div className="flex items-center justify-end">
            <CircleHelp className="h-4 w-4 mr-2" />
            <span>###</span>
          </div>
          <div className="flex items-center justify-end">
            <Footprints className="h-4 w-4 mr-2" />
            <span></span>
          </div>
        </div>
      </div>
    </div>
  );
};