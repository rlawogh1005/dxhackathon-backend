// --- 필요한 import ---
import { Suspense, useEffect, useState, useRef, useMemo } from 'react';
// ✨ 1. ThreeEvent 타입을 import 합니다.
import { Canvas, useThree, ThreeEvent } from '@react-three/fiber';
import { MapControls, useGLTF, Html } from '@react-three/drei';
import * as THREE from 'three';
import { MapControls as MapControlsImpl } from 'three-stdlib';
import { useQuery } from '@tanstack/react-query';
import gsap from 'gsap';
import { LocationService } from '@/services/locationService';

// --- 기준점 데이터 ---
// 3D 모델 기준점 A, B
const modelPointA = new THREE.Vector3(387.49, 0, -174.84);
const modelPointB = new THREE.Vector3(428.70, 0, -148.57);

// 실제 GPS 기준점 A, B (가상으로 할당)
const gpsPointA = { lat: 37.5547, lon: 126.9704 }; // 서울역
const gpsPointB = { lat: 37.5512, lon: 126.9882 }; // 남산타워


// --- 좌표 변환 함수 ---
const convertGpsTo3D = (lat: number, lon: number): THREE.Vector3 => {
  // GPS 좌표와 3D 모델 좌표 사이의 비율(스케일) 계산
  const latRatio = (lat - gpsPointA.lat) / (gpsPointB.lat - gpsPointA.lat);
  const lonRatio = (lon - gpsPointA.lon) / (gpsPointB.lon - gpsPointA.lon);

  // 선형 보간을 사용하여 3D 좌표 계산
  const x = modelPointA.x + (modelPointB.x - modelPointA.x) * lonRatio;
  const z = modelPointA.z + (modelPointB.z - modelPointA.z) * latRatio;

  // y값은 일단 0으로 두거나, 주변 지형에 따라 보간할 수 있습니다.
  // 여기서는 두 기준점의 y값을 사용하지 않으므로, 임의의 적절한 높이(예: -55)로 설정합니다.
  const y = -55;

  return new THREE.Vector3(x, y, z);
};


// --- 데이터 Fetching 함수 ---
const fetchLatestGpsData = async (): Promise<THREE.Vector3> => {
  const location = await LocationService.getCurrentLocation();
  return convertGpsTo3D(location.latitude, location.longitude);
};

const GpsMarker = ({ position, color = 'red' }) => {
  return (
    <mesh position={position} castShadow receiveShadow>
      <sphereGeometry args={[0.5, 16, 16]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
};


// Prop 타입 정의
interface ClickableMeshProps {
  node: THREE.Mesh; // useGLTF와 scene.traverse를 통해 추출된 GLB 파일의 개별 Mesh 객체(이 안에는 기하학적 모양, 재질, 위치, 회전 등 모든 정보가 포함되어 있음)
  onMeshClick: (point: THREE.Vector3, object: THREE.Object3D) => void; // 클릭 이벤트 핸들러
}
interface MapModelProps {
  onLoaded: (center: THREE.Vector3) => void;
  onMeshClick: (point: THREE.Vector3, object: THREE.Object3D) => void;
}


// ClickableMesh 컴포넌트 (래이캐스팅)
const ClickableMesh = ({ node, onMeshClick }: ClickableMeshProps) => { // ClickableMesh 타입의 컴포넌트이며, node와 onMeshClick 프로퍼티를 받음
  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation(); // 클릭 이벤트가 상위 요소로 전파되지 않도록 방지, 의도치 않은 중복 동작 방지
    onMeshClick(e.point, e.object); // e.point = 클릭한 위치의 3D 좌표, e.object = 클릭한 객체(노드)
  };

  // 실제로 그리는 부분
  return (
    <mesh
      geometry={node.geometry}
      material={node.material}
      position={node.position}
      rotation={node.rotation}
      scale={node.scale}
      castShadow
      receiveShadow
      onClick={handleClick}
    />
  );
};


// --- MapModel 컴포넌트 (변경 없음) ---
const MapModel = ({ onLoaded, onMeshClick }: MapModelProps) => {
    const { scene } = useGLTF('/assets/3d_assets/BlockABAAB/BlockABAAB.glb');

  const nodes = useMemo(() => {
    const meshNodes: THREE.Mesh[] = [];
    scene.traverse((node) => {
      if (node instanceof THREE.Mesh) {
        meshNodes.push(node);
      }
    });
    return meshNodes;
  }, [scene]);

  useEffect(() => {
    if (scene) {
      const box = new THREE.Box3().setFromObject(scene);
      const center = new THREE.Vector3();
      box.getCenter(center);
      onLoaded(center);
    }
  }, [scene, onLoaded]);

  return (
    <group scale={0.5}>
      {nodes.map((node) => (
        <ClickableMesh key={node.uuid} node={node} onMeshClick={onMeshClick} />
      ))}
    </group>
  );
};


// --- SceneContent 컴포넌트 (변경 없음) ---
const SceneContent = ({ modelCenter, setModelCenter, gpsPosition, isLoading }) => {
  const controlsRef = useRef<MapControlsImpl>(null);
  const { camera } = useThree();

  const handleMeshClick = (targetPoint: THREE.Vector3) => {
    console.log('Clicked 3D coordinates:', targetPoint);
    if (!controlsRef.current) return;
    const controls = controlsRef.current;
    const offset = camera.position.clone().sub(controls.target).normalize().multiplyScalar(30);
    const newCameraPosition = targetPoint.clone().add(offset);

    gsap.to(camera.position, {
      duration: 1.5,
      x: newCameraPosition.x,
      y: newCameraPosition.y,
      z: newCameraPosition.z,
      ease: 'power2.inOut',
    });

    gsap.to(controls.target, {
      duration: 1.5,
      x: targetPoint.x,
      y: targetPoint.y,
      z: targetPoint.z,
      ease: 'power2.inOut',
      onUpdate: () => {
        controls.update();
      },
    });
  };

  useEffect(() => {
    if (modelCenter && controlsRef.current) {
      camera.position.set(modelCenter.x, modelCenter.y + 30, modelCenter.z + 50);
      controlsRef.current.target.copy(modelCenter);
      controlsRef.current.update();
    }
  }, [modelCenter, camera]);

  return (
    <>
      <ambientLight intensity={1.5} />
      <directionalLight castShadow position={[100, 100, 100]} intensity={2.5} shadow-mapSize-width={2048} shadow-mapSize-height={2048} />
      <Suspense fallback={<Html center><h1>Loading Map...</h1></Html>}>
        <MapModel onLoaded={setModelCenter} onMeshClick={handleMeshClick} />
        {!isLoading && gpsPosition && <GpsMarker position={gpsPosition} />}
      </Suspense>
      <MapControls
        ref={controlsRef}
        enableDamping
        dampingFactor={0.05}
        screenSpacePanning
        maxPolarAngle={Math.PI / 2.2}
        minDistance={5}
        maxDistance={500}
      />
    </>
  );
};


// --- MapView 컴포넌트 ---
export const MapView = () => {
  const [modelCenter, setModelCenter] = useState<THREE.Vector3 | null>(null);
  
  const { data: gpsPosition, isLoading } = useQuery({
    queryKey: ['latestGps'],
    queryFn: fetchLatestGpsData,
    refetchInterval: 2000,
  });

  return (
    <div className="absolute inset-0 w-full h-full">
      <Canvas shadows camera={{ position: [0, 10, 50], fov: 60 }}>
        <SceneContent
          modelCenter={modelCenter}
          setModelCenter={setModelCenter}
          gpsPosition={gpsPosition}
          isLoading={isLoading}
        />
      </Canvas>
    </div>
  );
};