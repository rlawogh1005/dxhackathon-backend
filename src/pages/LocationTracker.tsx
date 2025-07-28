import { useState, useEffect } from 'react';
import { useLocation } from '@/hooks/useLocation';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { MapView } from '@/components/MapView';
import { MissingCard } from '@/components/MissingCard';
import { LocationInfo } from '@/components/LocationInfo';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { LocationService } from '@/services/locationService';

const LocationTracker = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [role, setRole] = useState<'guardian' | 'oldman' | null>(null);
  const [initializationError, setInitializationError] = useState<string | null>(null);

  useEffect(() => {
    const initializeDeviceId = async () => {
      try {
        // 기존의 잘못된 deviceId를 삭제합니다.
        localStorage.removeItem('deviceId');
        let id = localStorage.getItem('deviceId');
        if (!id) {
          console.log("No deviceId in localStorage, fetching from server...");
          const devices = await LocationService.getAllDevices();
          if (devices && devices.length > 0) {
            id = devices[0].id; // 첫 번째 디바이스 ID를 사용
            localStorage.setItem('deviceId', id);
            console.log(`Fetched and saved deviceId: ${id}`);
          } else {
            setInitializationError("등록된 디바이스가 없습니다. 디바이스를 먼저 등록해주세요.");
            return;
          }
        }
        setDeviceId(id);
      } catch (err) {
        console.error("Failed to initialize deviceId:", err);
        setInitializationError("디바이스 정보를 초기화하는데 실패했습니다.");
      }
    };

    initializeDeviceId();
  }, []);

  const { 
    currentLocation,
    loading, 
    error,
  } = useLocation(deviceId);
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

  if (loading || !deviceId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">위치 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-destructive mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen overflow-hidden bg-background">
      {/* 3D Map Background */}
      {/* <MapView /> */}

      {/* Header Overlay */}
      <Header 
        onMenuClick={handleMenuClick}
        currentAddress={currentLocation?.address || "위치를 찾는 중..."}
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
                location={currentLocation}
                address={currentLocation?.address || "세종특별시 조치원읍 으뜸길 215"}
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