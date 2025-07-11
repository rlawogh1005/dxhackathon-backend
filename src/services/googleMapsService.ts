import { Location } from '@/interfaces/location';

declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

export class GoogleMapsService {
  private static instance: GoogleMapsService;
  private map: any = null;
  private isLoaded = false;

  private constructor() {}

  static getInstance(): GoogleMapsService {
    if (!GoogleMapsService.instance) {
      GoogleMapsService.instance = new GoogleMapsService();
    }
    return GoogleMapsService.instance;
  }

  async loadGoogleMaps(apiKey: string): Promise<void> {
    if (this.isLoaded) return;

    return new Promise((resolve, reject) => {
      // Google Maps API 스크립트 로드
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry,places&callback=initMap`;
      script.async = true;
      script.defer = true;

      window.initMap = () => {
        this.isLoaded = true;
        resolve();
      };

      script.onerror = () => {
        reject(new Error('Google Maps API 로드 실패'));
      };

      document.head.appendChild(script);
    });
  }

  initialize3DMap(container: HTMLElement, center: Location): any {
    if (!window.google || !this.isLoaded) {
      throw new Error('Google Maps API가 로드되지 않았습니다.');
    }

    const mapOptions = {
      center: { lat: center.latitude, lng: center.longitude },
      zoom: 18,
      mapTypeId: 'satellite', // 위성 모드
      tilt: 45, // 3D 기울기
      heading: 0, // 방향
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      zoomControl: true,
      gestureHandling: 'greedy',
      styles: [
        {
          featureType: 'all',
          elementType: 'labels',
          stylers: [{ visibility: 'on' }]
        }
      ]
    };

    this.map = new window.google.maps.Map(container, mapOptions);
    
    // 3D 건물 활성화
    this.map.setTilt(45);
    
    return this.map;
  }

  addMarker(location: Location, title?: string): any {
    if (!this.map) return null;

    const marker = new window.google.maps.Marker({
      position: { lat: location.latitude, lng: location.longitude },
      map: this.map,
      title: title || location.address,
      animation: window.google.maps.Animation.DROP
    });

    return marker;
  }

  moveToLocation(location: Location): void {
    if (!this.map) return;

    this.map.panTo({ lat: location.latitude, lng: location.longitude });
    this.map.setZoom(18);
  }

  getCurrentLocation(): Promise<Location> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation이 지원되지 않습니다.'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const location: Location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            address: ''
          };

          // Geocoding으로 주소 가져오기
          if (window.google && window.google.maps) {
            const geocoder = new window.google.maps.Geocoder();
            try {
              const results = await this.geocodePosition(geocoder, location);
              location.address = results;
            } catch (err) {
              console.error('Geocoding 실패:', err);
            }
          }

          resolve(location);
        },
        (error) => {
          reject(new Error('위치 정보를 가져올 수 없습니다: ' + error.message));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        }
      );
    });
  }

  private geocodePosition(geocoder: any, location: Location): Promise<string> {
    return new Promise((resolve, reject) => {
      geocoder.geocode({
        location: { lat: location.latitude, lng: location.longitude }
      }, (results: any, status: any) => {
        if (status === 'OK' && results[0]) {
          resolve(results[0].formatted_address);
        } else {
          reject(new Error('Geocoding 실패'));
        }
      });
    });
  }
}