# SEIZE ON

> 치매 노인의 위치를 3D 환경에서 시각적으로 추적하는 실시간 웹 애플리케이션

![image.png](attachment:50257c60-6e4f-4d53-afa5-be49709ded8c:image.png)

---

## 📖 프로젝트 소개 (About)

**SEIZE ON**은 GPS 장치를 통해 수집된 치매 노인의 위치 데이터를 3D로 구현된 공간에 시각화하여, 보호자가 어르신의 위치를 직관적으로 파악하고 안전을 관리할 수 있도록 돕는 프로젝트입니다. 실제 지형 정보를 담은 3D 모델 위에서 실시간으로 위치를 추적하여 보다 현실감 있고 정확한 정보를 제공하는 것을 목표로 합니다.

## ✨ 주요 기능 (Features)

*   **🌐 실시간 3D 위치 시각화**: NestJS 백엔드로부터 받은 GPS 데이터를 React와 Three.js를 이용해 3D 맵 위에 실시간으로 렌더링합니다.
*   **🖱️ 인터랙티브 3D 맵**: 레이캐스팅(Raycasting) 기술을 활용하여 사용자가 3D 맵의 특정 지점을 클릭해 시점을 이동하는 등 상호작용이 가능합니다.
*   **🗺️ 정확한 위치 매핑**: 지오레퍼런싱(Georeferencing) 기술을 통해 실제 GPS 좌표(WGS84)와 3D 모델의 좌표를 정밀하게 일치시켜 위치 정보의 정확도를 높였습니다.
*   **🧩 모듈화된 아키텍처**: React 프론트엔드는 유지보수와 확장이 용이하도록 컴포넌트 기반으로 모듈화하여 설계되었습니다.

## 🛠️ 기술 스택 (Tech Stack)

| 구분 | 기술 | 설명 |
| :--- | :--- | :--- |
| **Frontend** | `React` `Three.js` | UI 구축 및 WebGL 기반 3D 그래픽 렌더링 |
| **Backend** | `NestJS` | GPS 데이터 수집 및 저장을 위한 API 서버 구축 |
| **3D Modeling** | `Blender` | 3D 지형 및 건물 모델링 (`.glb` 포맷) |
| **Georeferencing**| `DJI Terra` | 3D 모델에 실제 지리 좌표(WGS84)를 부여 |

## ⚙️ 핵심 기술 상세 (Core Technologies)

### 1. 3D 인터랙션: 레이캐스팅 (Raycasting)
사용자가 3D 공간과 원활하게 상호작용할 수 있도록 Three.js의 **레이캐스팅** 기술을 적용했습니다. 마우스 클릭 위치에서 가상의 광선(Ray)을 발사하여 `.glb` 모델의 메쉬(Mesh)와 교차하는 지점을 계산합니다. 이를 통해 사용자는 맵의 특정 지점으로 부드럽게 시점을 이동시키는 인터랙션을 경험할 수 있습니다.

### 2. 지오레퍼런싱 (Georeferencing)
본 프로젝트의 핵심은 현실의 GPS 좌표를 가상의 3D 공간에 정확히 매핑하는 것입니다.
- **DJI Terra** 프로그램을 사용하여 3D 모델에 **WGS84** 표준 좌표계를 적용하는 지오레퍼런싱 작업을 수행했습니다.
- 이로써 `.glb` 모델 자체가 실제 지리 정보를 포함하게 되었고, 백엔드에서 수집된 GPS 데이터를 별도의 복잡한 변환 과정 없이 3D 맵 위에 정확하게 투영할 수 있었습니다.

### 3. 시스템 아키텍처
<img width="1359" height="853" alt="Group 2085663873" src="https://github.com/user-attachments/assets/8321c95d-0264-46be-a0a3-5d7e7a9e6ad0" />


## 🚀 시작하기 (Getting Started)

### 사전 요구 사항
- Node.js (v18.x 이상)
- npm or yarn

### 설치 및 실행
1.  **저장소 복제**
    ```sh
    git clone https://github.com/your-username/seize-on.git
    cd seize-on
    ```

2.  **백엔드 서버 실행**
    ```sh
    cd backend
    npm install
    npm run start:dev
    ```

3.  **프론트엔드 서버 실행**
    ```sh
    cd frontend
    npm install
    npm start
    ```

## 📁 프로젝트 구조 (Project Structure)
```
SEIZE-ON/
├── 📂 backend/ # NestJS 백엔드 프로젝트
│ └── src/
│ ├── gps/ # GPS 데이터 처리 모듈
│ └── ...
├── 📂 frontend/ # React 프론트엔드 프로젝트
│ └── src/
│ ├── components/ # 공용 UI 컴포넌트
│ ├── hooks/ # 커스텀 훅
│ ├── three/ # Three.js 관련 모듈 (로더, 컨트롤러 등)
│ └── ...
└── 📂 3d-assets/ # 3D 모델 에셋 (.glb)
```

## ✍️ 만든이 (Author)

- **[Jaeho Kim]** - `jaehokim1005@g.hongik.ac.kr`
