import { useState } from 'react';
import { useLocation } from '@/hooks/useLocation';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { MapView } from '@/components/MapView';
import { WeatherCard } from '@/components/WeatherCard';

import { LocationInfo } from '@/components/LocationInfo';
import { useToast } from '@/hooks/use-toast';

const LocationTracker = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { 
    currentLocation, 
    weatherInfo, 
    deviceInfo, 
    loading, 
    error, 
    searchLocation 
  } = useLocation();
  const { toast } = useToast();

  const handleMenuClick = () => {
    setIsSidebarOpen(true);
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) return;
    
    try {
      const results = await searchLocation(query);
      toast({
        title: "검색 완료", 
        description: `"${query}"에 대한 ${results.length}개의 결과를 찾았습니다.`
      });
    } catch (err) {
      toast({
        title: "검색 실패",
        description: "검색 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    }
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
      <MapView 
        center={{
          lat: currentLocation?.latitude || 36.5184,
          lng: currentLocation?.longitude || 127.2043
        }} 
      />

      {/* Header Overlay */}
      <Header 
        onMenuClick={handleMenuClick}
        onSearch={handleSearch}
        currentAddress={currentLocation?.address || "위치를 찾는 중..."}
        onReportClick={handleReportClick}
        onMissingTimeClick={handleMissingTimeClick}
      />

      {/* Weather Card */}
      <WeatherCard 
        weatherInfo={weatherInfo}
        deviceInfo={deviceInfo}
      />

      {/* Location Info */}
      <LocationInfo 
        location={currentLocation}
        address={currentLocation?.address || "세종특별시 조치원읍 으뜩길 215"}
      />

      {/* Sidebar */}
      <Sidebar 
        isOpen={isSidebarOpen}
        onClose={handleCloseSidebar}
      />
    </div>
  );
};

export default LocationTracker;