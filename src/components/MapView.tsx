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
  const { camera, controls } = useThree();

  const handleMeshClick = (clickedPoint: THREE.Vector3, clickedObject: THREE.Object3D) => {
    console.log('Clicked Object:', clickedObject.name);

    if (controlsRef.current && clickedObject) {
      const controls = controlsRef.current;
      const objectCenter = new THREE.Vector3();
      new THREE.Box3().setFromObject(clickedObject).getCenter(objectCenter);

      // ✨ [수정] 현재 거리에서 일정 비율(예: 0.5)만큼 가까워지도록 newDistance를 계산합니다.
      const currentDistance = camera.position.distanceTo(controls.target);
      const newDistance = currentDistance * 0.2; // 50%만큼 가까이 갑니다. 0.7로 하면 30%만 다가갑니다.
      
      const direction = new THREE.Vector3().subVectors(camera.position, controls.target).normalize();

      // ✨ 계산된 newDistance를 사용하여 새로운 카메라 위치를 결정합니다.
      const newCameraPosition = new THREE.Vector3().addVectors(objectCenter, direction.multiplyScalar(newDistance));
      
      // ✨ [수정 3] 하나의 GSAP 애니메이션으로 카메라와 타겟을 동시에 제어합니다.
      // proxy 객체를 만들어 중간 값을 계산하고, onUpdate에서 실제 값에 적용합니다.
      const proxy = {
        camX: camera.position.x,
        camY: camera.position.y,
        camZ: camera.position.z,
        targetX: controls.target.x,
        targetY: controls.target.y,
        targetZ: controls.target.z,
      };

      gsap.to(proxy, {
        duration: 1.5,
        ease: 'power2.inOut',
        // 목표 값 설정
        camX: newCameraPosition.x,
        camY: newCameraPosition.y,
        camZ: newCameraPosition.z,
        targetX: objectCenter.x,
        targetY: objectCenter.y,
        targetZ: objectCenter.z,
        // 애니메이션 매 프레임마다 실행
        onUpdate: () => {
          camera.position.set(proxy.camX, proxy.camY, proxy.camZ);
          controls.target.set(proxy.targetX, proxy.targetY, proxy.targetZ);
          controls.update(); // 변경된 위치와 타겟을 컨트롤에 즉시 반영
        },
        onComplete: () => {
          // 애니메이션 완료 후 최종 값으로 확정
          camera.position.copy(newCameraPosition);
          controls.target.copy(objectCenter);
          controls.update();
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
        enableDamping // 부드러운 움직임 활성화
        dampingFactor={0.05}

        // === 자유로운 조작감을 위한 핵심 속성들 ===
        
        // 1. 패닝(카메라 이동) 활성화
        enablePan={true}
        screenSpacePanning={true} // true일 때, 화면 기준 상하좌우로 자연스럽게 이동

        // 2. 줌 활성화 (마우스 휠)
        enableZoom={true}

        // 3. 회전 활성화
        enableRotate={true}
        
        // 4. ✨ 완전한 수직 회전 허용 (가장 중요)
        minPolarAngle={0} // 0 (정수리에서 보기)
        maxPolarAngle={Math.PI} // Math.PI (바닥에서 보기)

        // 5. ✨ 마우스 버튼 설정을 제거하여 기본값으로 되돌립니다.
        // 기본값: LEFT(회전), MIDDLE(줌), RIGHT(패닝)
          mouseButtons={{
          LEFT: THREE.MOUSE.ROTATE, // 왼쪽 버튼: 회전
          MIDDLE: THREE.MOUSE.DOLLY, // 중간 버튼(휠 클릭): 줌
          RIGHT: THREE.MOUSE.PAN    // 오른쪽 버튼: 평면 이동
        }}
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