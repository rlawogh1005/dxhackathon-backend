// --- 필요한 import ---
import { Suspense, useEffect, useState, useRef, useMemo } from 'react';
// ✨ 1. ThreeEvent 타입을 import 합니다.
import { Canvas, useThree, ThreeEvent } from '@react-three/fiber';
import { MapControls, useGLTF, Html } from '@react-three/drei';
import * as THREE from 'three';
import { MapControls as MapControlsImpl } from 'three-stdlib';
import { useQuery } from '@tanstack/react-query';
import gsap from 'gsap';

// --- 가짜 API, GpsMarker는 변경 없음 ---
const fetchLatestGpsData = async (basePosition: THREE.Vector3): Promise<THREE.Vector3> => { /* ... */ return new THREE.Vector3(); };
const GpsMarker = ({ position, color = 'red' }) => { /* ... */ return null; };


// --- Prop 타입 정의 (변경 없음) ---
interface ClickableMeshProps {
  node: THREE.Mesh;
  onMeshClick: (point: THREE.Vector3, object: THREE.Object3D) => void;
}
interface MapModelProps {
  onLoaded: (center: THREE.Vector3) => void;
  onMeshClick: (point: THREE.Vector3, object: THREE.Object3D) => void;
}


// --- ClickableMesh 컴포넌트 (타입 수정) ---
const ClickableMesh = ({ node, onMeshClick }: ClickableMeshProps) => {
  // ✨ 2. 'e'의 타입을 ThreeEvent<MouseEvent>로 정확하게 지정합니다.
  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onMeshClick(e.point, e.object);
  };

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


// --- MapView 컴포넌트 (useQuery 수정) ---
export const MapView = () => {
  const [modelCenter, setModelCenter] = useState<THREE.Vector3 | null>(null);
  
  // ✨ 3. useQuery에 필수 옵션인 queryKey와 queryFn 등을 다시 채워 넣습니다.
  const { data: gpsPosition, isLoading } = useQuery({
    queryKey: ['latestGps', modelCenter],
    queryFn: () => fetchLatestGpsData(modelCenter!),
    enabled: !!modelCenter,
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