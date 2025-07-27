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

// --- 모델 파일 목록 ---
// public/assets/3d_assets/ 폴더에 위치한 GLB 파일들의 이름입니다.
const modelFiles = [
  'BlockABA', 'BlockABX', 'BlockAYA', 'BlockAYX',
  'BlockXBA', 'BlockXBX', 'BlockXYA', 'BlockXYX'
];
const modelPaths = modelFiles.map(name => `/assets/3d_assets/${name}.glb`);

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
  // onLoaded가 center와 size를 포함하는 객체를 받도록 수정
  onLoaded: (bounds: { center: THREE.Vector3; size: THREE.Vector3 }) => void;
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


// --- MapModel 컴포넌트 (여러 모델을 로드하도록 수정) ---
const MapModel = ({ onLoaded, onMeshClick }: MapModelProps) => {
  const groupRef = useRef<THREE.Group>(null!);

  // 모든 모델이 로드된 후, 전체 그룹의 중심과 크기를 계산하여 onLoaded 콜백을 호출합니다.
  useEffect(() => {
    // Suspense 덕분에 이 effect는 모든 useGLTF가 완료된 후에 실행됩니다.
    if (groupRef.current && groupRef.current.children.length > 0) {
      const box = new THREE.Box3().setFromObject(groupRef.current);
      const center = new THREE.Vector3();
      const size = new THREE.Vector3();
      box.getCenter(center);
      box.getSize(size);
      
      // onLoaded 콜백에 center와 size를 포함한 객체를 전달합니다.
      onLoaded({ center, size });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 이 effect는 마운트 시 한 번만 실행되도록 하여, 모든 모델 로드 후 단일 호출을 보장합니다.


  return (
    <group scale={0.5} ref={groupRef}>
      {modelPaths.map((path) => (
        <Model key={path} path={path} onMeshClick={onMeshClick} />
      ))}
    </group>
  );
};

// --- 개별 모델 로딩 및 노드 추출을 위한 컴포넌트 ---
interface ModelProps {
  path: string;
  onMeshClick: (point: THREE.Vector3, object: THREE.Object3D) => void;
}

const Model = ({ path, onMeshClick }: ModelProps) => {
  const { scene } = useGLTF(path);
  
  // useMemo를 사용하여 GLTF 씬에서 메쉬 노드를 효율적으로 추출합니다.
  const nodes = useMemo(() => {
    const meshNodes: THREE.Mesh[] = [];
    scene.traverse((node) => {
      if (node instanceof THREE.Mesh) {
        meshNodes.push(node);
      }
    });
    return meshNodes;
  }, [scene]);

  return (
    <>
      {nodes.map((node) => (
        <ClickableMesh key={node.uuid} node={node} onMeshClick={onMeshClick} />
      ))}
    </>
  );
};


// --- SceneContent 컴포넌트 ---
const SceneContent = ({ modelBounds, setModelBounds, gpsPosition, isLoading }) => {
  const controlsRef = useRef<MapControlsImpl>(null);
  // 카메라 타입을 명확히 하여 fov 속성 접근 오류를 해결합니다.
  const { camera } = useThree() as { camera: THREE.PerspectiveCamera };

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

  // modelBounds가 설정되면 카메라 위치를 동적으로 조정합니다.
  useEffect(() => {
    if (modelBounds && controlsRef.current) {
      const { center, size } = modelBounds;

      // 모든 모델을 포함하는 경계 상자의 가장 긴 차원을 기준으로 카메라 거리를 계산합니다.
      const maxDim = Math.max(size.x, size.y, size.z);
      const fov = camera.fov * (Math.PI / 180);
      const cameraDistance = maxDim / (2 * Math.tan(fov / 2));
      
      // 약간의 여백을 주기 위해 거리를 1.2배 늘립니다.
      const margin = 1.2;
      const cameraPosition = new THREE.Vector3(
        center.x, 
        center.y + maxDim * 0.5, // 위에서 내려다보는 구도
        center.z + cameraDistance * margin
      );
      
      // 카메라 위치와 타겟을 부드럽게 이동시킵니다.
      gsap.to(camera.position, {
        duration: 1.5,
        x: cameraPosition.x,
        y: cameraPosition.y,
        z: cameraPosition.z,
        ease: 'power2.inOut',
      });

      gsap.to(controlsRef.current.target, {
        duration: 1.5,
        x: center.x,
        y: center.y,
        z: center.z,
        ease: 'power2.inOut',
        onUpdate: () => {
          controlsRef.current?.update();
        },
      });
    }
  }, [modelBounds, camera]);

  return (
    <>
      <ambientLight intensity={1.5} />
      <directionalLight castShadow position={[100, 100, 100]} intensity={2.5} shadow-mapSize-width={2048} shadow-mapSize-height={2048} />
      <Suspense fallback={<Html center><h1>Loading Map...</h1></Html>}>
        <MapModel onLoaded={setModelBounds} onMeshClick={handleMeshClick} />
        {!isLoading && gpsPosition && <GpsMarker position={gpsPosition} />}
      </Suspense>
      <MapControls
        ref={controlsRef}
        enableDamping
        dampingFactor={0.05}
        screenSpacePanning
        maxPolarAngle={Math.PI / 2.2}
        minDistance={5}
        maxDistance={5000} // 멀리서도 볼 수 있도록 최대 거리 증가
      />
    </>
  );
};


// --- MapView 컴포넌트 ---
export const MapView = () => {
  // modelCenter 대신 modelBounds(중심점 + 크기) 상태를 사용
  const [modelBounds, setModelBounds] = useState<{ center: THREE.Vector3; size: THREE.Vector3 } | null>(null);
  
  const { data: gpsPosition, isLoading } = useQuery({
    queryKey: ['latestGps'],
    queryFn: fetchLatestGpsData,
    refetchInterval: 2000,
  });

  return (
    <div className="absolute inset-0 w-full h-full">
      {/* 초기 카메라 위치는 effect에 의해 곧바로 변경되므로 크게 중요하지 않습니다. */}
      <Canvas shadows camera={{ position: [0, 10, 50], fov: 60 }}>
        <SceneContent
          modelBounds={modelBounds}
          setModelBounds={setModelBounds}
          gpsPosition={gpsPosition}
          isLoading={isLoading}
        />
      </Canvas>
    </div>
  );
};