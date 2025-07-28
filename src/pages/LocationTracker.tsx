import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { MapView } from '@/components/MapView';
import { MissingCard } from '@/components/MissingCard';
import { LocationInfo } from '@/components/LocationInfo';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { LocationService } from '@/services/locationService';
import { Location } from '@/interfaces/location';

const LocationTracker = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [initializationError, setInitializationError] = useState<string | null>(null);
  const [guardianLocation, setGuardianLocation] = useState<Location | null>(null);
  const [oldmanLocation, setOldmanLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeLocations = async () => {
      try {
        setLoading(true);
        const devices = await LocationService.getAllDevices();

        const guardianDevices = devices.filter(d => d.role === 'guardian');
        const oldmanDevices = devices.filter(d => d.role === 'oldman');

        const locationPromises: Promise<Location | null>[] = [];

        if (guardianDevices.length > 0) {
          guardianDevices.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          locationPromises.push(LocationService.getCurrentLocation(guardianDevices[0].deviceId));
        } else {
          locationPromises.push(Promise.resolve(null));
        }

        if (oldmanDevices.length > 0) {
          oldmanDevices.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          locationPromises.push(LocationService.getCurrentLocation(oldmanDevices[0].deviceId));
        } else {
          locationPromises.push(Promise.resolve(null));
        }

        const [guardianLoc, oldmanLoc] = await Promise.all(locationPromises);

        setGuardianLocation(guardianLoc);
        setOldmanLocation(oldmanLoc);
        
        if (!guardianLoc && !oldmanLoc && devices.length === 0) {
          setInitializationError("등록된 디바이스가 없습니다.");
        }

      } catch (err) {
        console.error("Failed to initialize locations:", err);
        setInitializationError("위치 정보를 초기화하는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    initializeLocations();
  }, []);

  const { toast } = useToast();

  const handleMenuClick = () => {
    setIsSidebarOpen(true);
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
  };

  const handleReportClick = () => {
    toast({
      title: "신고 기능",
      description: "신고 기능이 활성화되었습니다."
    });
  };

  const handleMissingTimeClick = () => {
    toast({
      title: "실종 시간",
      description: "실종 시간 설정 화면으로 이동합니다."
    });
  };

  if (initializationError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-destructive mb-4">{initializationError}</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">위치 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }
  
  const currentDisplayLocation = oldmanLocation || guardianLocation;

  return (
    <div className="relative w-full h-screen overflow-hidden bg-background">
      {/* 3D Map Background */}
      <MapView 
        guardianLocation={guardianLocation}
        oldmanLocation={oldmanLocation}
      />

      {/* Header Overlay */}
      <Header 
        onMenuClick={handleMenuClick}
        currentAddress={currentDisplayLocation?.address || "위치를 찾는 중..."}
        onReportClick={handleReportClick}
        onMissingTimeClick={handleMissingTimeClick}
      />

      {/* Bottom UI container */}
      <div className="absolute inset-x-0 bottom-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-stretch justify-between gap-4">
            <MissingCard 
                className="flex-shrink-0"
            />
            <LocationInfo 
                location={currentDisplayLocation}
                address={currentDisplayLocation?.address || "세종특별시 조치원읍 으뜸길 215"}
                className="flex-grow"
            />
          
          {/* Navigation Button */}
          <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-[63px] rounded-2xl flex-shrink-0">
            안내 시작
          </Button>
        </div>
      </div>


      {/* Sidebar */}
      <Sidebar 
        isOpen={isSidebarOpen}
        onClose={handleCloseSidebar}
      />
    </div>
  );
};

export default LocationTracker;