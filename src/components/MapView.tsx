import { Suspense, useEffect, useState, useRef } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { MapControls, useGLTF, Html } from '@react-three/drei';
import * as THREE from 'three';
import { MapControls as MapControlsImpl } from 'three-stdlib';
import { useQuery } from '@tanstack/react-query';


// --- 가짜 백엔드 API 시뮬레이션 ---
// 실제로는 fetch('/api/latest-gps') 와 같은 코드가 됩니다.
const fetchLatestGpsData = async (basePosition: THREE.Vector3): Promise<THREE.Vector3> => {
  console.log("Fetching latest GPS data...");
  // 네트워크 지연 시뮬레이션
  await new Promise(resolve => setTimeout(resolve, 500)); 
  
  // 맵 중심에서 x, z 방향으로 -5 ~ +5 범위 내에서 무작위로 움직이는 좌표 생성
  const newPosition = basePosition.clone();
  newPosition.x += (Math.random() - 0.5) * 10;
  newPosition.z += (Math.random() - 0.5) * 10;
  newPosition.y += 1; // 지표면 위에 있도록

  return newPosition;
}


// (신규) GPS 마커 컴포넌트
const GpsMarker = ({ position, color = 'red' }) => {
  return (
    <mesh position={position}>
      <sphereGeometry args={[0.5, 32, 32]} />
      <meshStandardMaterial 
        color={color} 
        emissive={color} 
        emissiveIntensity={4} // 마커가 스스로 빛나도록 하여 잘 보이게 함
        toneMapped={false} // 씬의 조명에 색이 바래지 않도록 함
      />
    </mesh>
  );
};


// Helper component to adjust camera and controls after model is loaded
const CameraController = ({ modelCenter, controlsRef }) => {
  const { camera } = useThree();

  useEffect(() => {
    if (modelCenter && controlsRef.current) {
      // Set the controls target to the model's center
      controlsRef.current.target.copy(modelCenter);
      
      // Position the camera to look at the model from a reasonable distance
      camera.position.set(modelCenter.x, modelCenter.y, modelCenter.z + 50);
      
      // Important: After changing camera position or controls target, we must update the controls.
      controlsRef.current.update();
    }
  }, [modelCenter, camera, controlsRef]);

  return null; // This component doesn't render anything itself
};

// 1. 지도 모델 (로드 완료 후 정보 전달)
const MapModel = ({ onLoaded }) => {
  const { scene } = useGLTF('/assets/3d_assets/BlockABAAB/BlockABAAB.glb');
  const groupRef = useRef<THREE.Group>(null);
  
  useEffect(() => {
    // useEffect runs after the component mounts and the ref is attached.
    // We can now safely measure the group that contains the scaled model.
    if (groupRef.current) {
      const box = new THREE.Box3().setFromObject(groupRef.current);
      const center = new THREE.Vector3();
      box.getCenter(center);
      onLoaded(center);
    }
  }, [onLoaded]);

  return (
      <group ref={groupRef} scale={0.5}>
        <primitive object={scene} />
      </group>
  );
};

// 2. 메인 뷰 컴포넌트 (모델 중심으로 카메라 자동 조정)
export const MapView = () => {
  const [modelCenter, setModelCenter] = useState<THREE.Vector3 | null>(null);
  const controlsRef = useRef<MapControlsImpl>(null);

  // React Query를 사용하여 2초마다 GPS 데이터를 폴링합니다.
  const { data: gpsPosition, isLoading } = useQuery({
    queryKey: ['latestGps', modelCenter], // 쿼리 식별자
    queryFn: () => fetchLatestGpsData(modelCenter!), // 데이터를 가져오는 함수
    enabled: !!modelCenter, // modelCenter가 설정된 후에만 쿼리 실행
    refetchInterval: 2000, // 2000ms (2초) 마다 자동으로 다시 가져옴
  });

  return (
    <div className="absolute inset-0 w-full h-full">
      <Canvas shadows camera={{ position: [0, 1, 0], fov: 60 }}>
        <ambientLight intensity={1.5} />
        <directionalLight 
          position={[100, 100, 100]} 
          intensity={2.5} 
          castShadow 
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        
        <Suspense fallback={<Html center><h1>Loading Map...</h1></Html>}>
          <MapModel onLoaded={setModelCenter} />
          
          {/* 로딩이 아니고, GPS 위치 데이터가 있으면 마커를 렌더링합니다. */}
          {!isLoading && gpsPosition && (
            <GpsMarker position={gpsPosition} />
          )}
        </Suspense>
        
        <MapControls 
          ref={controlsRef}
          enableDamping={true}
          dampingFactor={0.05}
          screenSpacePanning={false}
          maxPolarAngle={Math.PI / 2.2}
          minDistance={5}
          maxDistance={200}
        />

        {modelCenter && <CameraController modelCenter={modelCenter} controlsRef={controlsRef} />}
      </Canvas>
    </div>
  );
};