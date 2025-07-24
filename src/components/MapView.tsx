// --- 필요한 import ---
import { Suspense, useEffect, useState, useRef } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { MapControls, useGLTF, Html } from '@react-three/drei';
import * as THREE from 'three';
import { MapControls as MapControlsImpl } from 'three-stdlib';
import { useQuery } from '@tanstack/react-query';


// --- 가짜 백엔드 API 시뮬레이션 (변경 없음) ---
const fetchLatestGpsData = async (basePosition: THREE.Vector3): Promise<THREE.Vector3> => {
  console.log("Fetching latest GPS data...");
  await new Promise(resolve => setTimeout(resolve, 500)); 
  const newPosition = basePosition.clone();
  newPosition.x += (Math.random() - 0.5) * 10;
  newPosition.z += (Math.random() - 0.5) * 10;
  newPosition.y += 1;
  return newPosition;
}

// --- GPS 마커 컴포넌트 (변경 없음) ---
const GpsMarker = ({ position, color = 'red' }) => {
  return (
    <mesh position={position}>
      <sphereGeometry args={[0.5, 32, 32]} />
      <meshStandardMaterial 
        color={color} 
        emissive={color} 
        emissiveIntensity={4}
        toneMapped={false}
      />
    </mesh>
  );
};

// --- 카메라 컨트롤러 (변경 없음) ---
const CameraController = ({ modelCenter, controlsRef }) => {
  const { camera } = useThree();

  useEffect(() => {
    if (modelCenter && controlsRef.current) {
      controlsRef.current.target.copy(modelCenter);
      camera.position.set(modelCenter.x, modelCenter.y, modelCenter.z + 50);
      controlsRef.current.update();
    }
  }, [modelCenter, camera, controlsRef]);

  return null;
};

// --- ✨ [수정됨] 지도 모델 (모델 구조 분석 코드 추가) ✨ ---
const MapModel = ({ onLoaded }) => {
  // useGLTF는 scene 객체를 포함한 gltf 전체 데이터를 반환합니다.
  const { scene } = useGLTF('/assets/3d_assets/BlockABAAB/BlockABAAB.glb');
  const groupRef = useRef<THREE.Group>(null);
  
  useEffect(() => {
    if (groupRef.current && scene) {
      // --- 기존 코드 (모델의 중심 계산) ---
      const box = new THREE.Box3().setFromObject(groupRef.current);
      const center = new THREE.Vector3();
      box.getCenter(center);
      onLoaded(center);
    }
    // useEffect의 의존성 배열에 scene을 추가합니다.
  }, [scene, onLoaded]);

  return (
      <group ref={groupRef} scale={0.5}>
        <primitive object={scene} />
      </group>
  );
};

// --- 메인 뷰 컴포넌트 (변경 없음) ---
export const MapView = () => {
  const [modelCenter, setModelCenter] = useState<THREE.Vector3 | null>(null);
  const controlsRef = useRef<MapControlsImpl>(null);

  const { data: gpsPosition, isLoading } = useQuery({
    queryKey: ['latestGps', modelCenter],
    queryFn: () => fetchLatestGpsData(modelCenter!),
    enabled: !!modelCenter,
    refetchInterval: 2000,
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