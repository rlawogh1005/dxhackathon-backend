// --- 필요한 import ---
import { Suspense, useEffect, useState, useRef, useMemo } from 'react';
// ✨ 1. ThreeEvent 타입을 import 합니다.
import { Canvas, useThree, ThreeEvent } from '@react-three/fiber';
import { MapControls, useGLTF, Html } from '@react-three/drei';
import * as THREE from 'three';
import { MapControls as MapControlsImpl } from 'three-stdlib';
import gsap from 'gsap';

// --- 모델 파일 목록 ---
// public/assets/3d_assets/ 폴더에 위치한 GLB 파일들의 이름입니다.
const modelFiles = [
  'BlockABA', 'BlockABX', 'BlockAYA', 'BlockAYX', 'BlockXBA', 'BlockXBX', 'BlockXYA', 'BlockXYX'
];
const modelPaths = modelFiles.map(name => `/assets/3d_assets/${name}_optimized.glb`);

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

interface ModelProps {
  path: string;
  onMeshClick: (point: THREE.Vector3, object: THREE.Object3D) => void;
  // 재질 공유 로직은 더 이상 필요 없습니다. useGLTF가 알아서 캐싱합니다.
}

const Model = ({ path, onMeshClick }: ModelProps) => {
  // useGLTF는 내부적으로 캐싱을 하므로, 동일한 경로의 모델은 한 번만 로드됩니다.
  const { scene } = useGLTF(path);

  // scene 객체 전체에 클릭 이벤트를 위임합니다.
  // R3F가 알아서 올바른 하위 메쉬에서 발생한 이벤트를 감지해줍니다.
  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    // e.object는 실제로 클릭된 하위 메쉬 객체입니다.
    onMeshClick(e.point, e.object);
  };

  // clone()을 사용하여 원본 scene을 여러번 재사용할 수 있도록 합니다.
  return <primitive object={scene.clone()} onClick={handleClick} />;
};

// --- MapModel 컴포넌트 (여러 모델을 로드하도록 수정) ---
const MapModel = ({ onLoaded, onMeshClick }: MapModelProps) => {
  const groupRef = useRef<THREE.Group>(null!);
  // ✨ 재질 공유를 위한 저장소를 useRef로 생성합니다.
  const uniqueMaterials = useRef(new Map<string, THREE.Material>());

  useEffect(() => {
    // 이 Effect는 모든 자식 Model 컴포넌트가 Suspense에 의해 로드된 후 실행됩니다.
    if (groupRef.current) {
        // 자식 노드가 실제로 추가된 후에 박스를 계산해야 정확합니다.
        requestAnimationFrame(() => {
            if (groupRef.current?.children.length > 0) {
                const box = new THREE.Box3().setFromObject(groupRef.current);
                const center = new THREE.Vector3();
                const size = new THREE.Vector3();
                box.getCenter(center);
                box.getSize(size);
                onLoaded({ center, size });
                console.log(`총 ${modelPaths.length}개 모델 로드 완료. 고유 재질 개수: ${uniqueMaterials.current.size}개`);
            }
        });
    }
  }, [onLoaded]); 

    return (
    // ✨ group에서 castShadow와 receiveShadow를 제거합니다.
    <group scale={0.5} ref={groupRef}>
      {modelPaths.map((path) => (
        <Model
          key={path}
          path={path}
          onMeshClick={onMeshClick}
        />
      ))}
    </group>
  );
};

// --- SceneContent 컴포넌트 ---
const SceneContent = ({ modelBounds, setModelBounds }) => {
  const controlsRef = useRef<MapControlsImpl>(null);
  const { camera, controls } = useThree(); // ✨ useThree에서 controls를 직접 가져올 수 있습니다.

const handleMeshClick = (targetPoint: THREE.Vector3) => {
    console.log('Clicked 3D coordinates:', targetPoint);
    if (controlsRef.current) {
        const controls = controlsRef.current;
        const offset = camera.position.clone().sub(controls.target).normalize().multiplyScalar(30);
        const newCameraPosition = targetPoint.clone().add(offset);

        // 1. 카메라 위치를 부드럽게 이동시킵니다. (기존과 동일)
        gsap.to(camera.position, {
            duration: 1.5,
            x: newCameraPosition.x,
            y: newCameraPosition.y,
            z: newCameraPosition.z,
            ease: 'power2.inOut',
        });

        // 2. 카메라의 '타겟'도 부드럽게 이동시키면서, 완료된 후 타겟을 '확정'합니다.
        gsap.to(controls.target, {
            duration: 1.5,
            x: targetPoint.x,
            y: targetPoint.y,
            z: targetPoint.z,
            ease: 'power2.inOut',
            onUpdate: () => {
                // 애니메이션 중간 과정에도 컨트롤을 계속 업데이트합니다.
                controls.update();
            },
            // ✨ [핵심] 애니메이션이 완전히 끝났을 때 실행됩니다.
            onComplete: () => {
                // 컨트롤러의 타겟 위치를 클릭한 지점으로 명확하게 재설정하고 확정합니다.
                controls.target.copy(targetPoint);
            }
        });
    }
};
  // 👑 [수정] modelBounds가 설정되면 카메라 위치를 '즉시' 조정합니다.
  useEffect(() => {
    // modelBounds와 controlsRef.current가 모두 준비되었을 때만 실행합니다.
    if (modelBounds && controlsRef.current) {
      const { center, size } = modelBounds;
      const currentControls = controlsRef.current;

      // 1. 카메라 위치 계산 (기존 로직과 유사)
      const maxDim = Math.max(size.x, size.y, size.z);
      // fov를 PerspectiveCamera 타입에서 안전하게 가져옵니다.
      const fov = (camera instanceof THREE.PerspectiveCamera) ? camera.fov * (Math.PI / 180) : 75 * (Math.PI / 180);
      const cameraDistance = maxDim / (2 * Math.tan(fov / 2));
      
      const margin = 1.5; // 여백을 조금 더 줍니다.
      const cameraPosition = new THREE.Vector3(
        center.x,
        center.y + maxDim * 0.5, // 위에서 내려다보는 구도
        center.z + cameraDistance * margin
      );

      // 2. ✨ GSAP 애니메이션 대신 카메라 위치를 '즉시' 설정합니다.
      camera.position.set(cameraPosition.x, cameraPosition.y, cameraPosition.z);

      // 3. ✨ 컨트롤(카메라 시점의 중심)의 타겟도 '즉시' 설정합니다.
      currentControls.target.set(center.x, center.y, center.z);

      // 4. ✨ 변경된 타겟과 위치를 컨트롤에 즉시 반영합니다.
      currentControls.update();
    }
  }, [modelBounds, camera]); // 의존성 배열 유지

  return (
    <>
      <ambientLight intensity={1.5} />
      {/* ✨ directionalLight에서 castShadow와 shadow-mapSize 관련 prop들을 모두 제거합니다. */}
      <directionalLight position={[100, 100, 100]} intensity={2.5} />

      <Suspense fallback={<Html center><h1>Loading Map...</h1></Html>}>
        <MapModel onLoaded={setModelBounds} onMeshClick={handleMeshClick} />
      </Suspense>

      <MapControls
        ref={controlsRef}
        enableDamping
        dampingFactor={0.05}
        screenSpacePanning
        minDistance={5}
        maxDistance={5000}
      />
    </>
  );
};


// --- MapView 컴포넌트 ---
export const MapView = () => {
  // modelCenter 대신 modelBounds(중심점 + 크기) 상태를 사용
  const [modelBounds, setModelBounds] = useState<{ center: THREE.Vector3; size: THREE.Vector3 } | null>(null);
  
    return (
    <div className="absolute inset-0 w-full h-full">
      {/* ✨ Canvas에서 shadows prop을 제거합니다. */}
      <Canvas camera={{ position: [0, 10, 50], fov: 60 }}>
        <SceneContent
          modelBounds={modelBounds}
          setModelBounds={setModelBounds}
        />
      </Canvas>
    </div>
  );
};