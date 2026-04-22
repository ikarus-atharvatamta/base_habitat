import React, {
  Suspense,
  useRef,
  useEffect,
  useState,
  useMemo,
  useCallback,
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  OrbitControls,
  Center,
  useGLTF,
  PerspectiveCamera,
  Environment,
  Html,
  useProgress,
  ContactShadows,
} from "@react-three/drei";
import * as THREE from "three";

const VIEWPOINTS_AZIMUTH = [
  Math.PI * 0.25, // 45 deg
  Math.PI * 0.75, // 135 deg
  Math.PI * 1.25, // 225 deg
  Math.PI * 1.75, // 315 deg
];

// Rendered OUTSIDE the Canvas — useProgress hooks into a global Zustand store so this works fine.
function LoadingOverlay() {
  const { active, progress } = useProgress();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!active && progress >= 100) {
      const t = setTimeout(() => setVisible(false), 400);
      return () => clearTimeout(t);
    }
  }, [active, progress]);

  if (!visible) return null;

  return (
    <div
      className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none"
      style={{ opacity: visible ? 1 : 0, transition: "opacity 0.4s ease-out" }}
    >
      <div className="w-[200px] md:w-[240px] h-1 bg-black/5 rounded-full overflow-hidden backdrop-blur-sm border border-black/5">
        <div
          className="h-full bg-black transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

function CameraHandler({
  viewIndex,
  viewMode,
  distance,
  onInteraction,
  onCameraOverhead,
}) {
  const { camera } = useThree();
  const controlsRef = useRef();
  const isTransitioning = useRef(false);
  const lastIndex = useRef(viewIndex);
  const lastMode = useRef(viewMode);
  const overheadFired = useRef(false);

  useEffect(() => {
    if (viewIndex !== lastIndex.current || viewMode !== lastMode.current) {
      isTransitioning.current = true;
      // Reset overhead flag when starting a new transition to interior
      if (viewMode === "interior") {
        overheadFired.current = false;
      }
      lastIndex.current = viewIndex;
      lastMode.current = viewMode;
    }
  }, [viewIndex, viewMode]);

  useFrame((state, delta) => {
    if (!controlsRef.current) return;

    // console.log(
    //   `Camera — polar: ${controlsRef.current.getPolarAngle().toFixed(3)}, azimuth: ${controlsRef.current.getAzimuthalAngle().toFixed(3)}, pos: (${state.camera.position.x.toFixed(2)}, ${state.camera.position.y.toFixed(2)}, ${state.camera.position.z.toFixed(2)})`
    // );

    if (isTransitioning.current) {
      let targetAzimuth, targetPolar;
      const targetCenter = new THREE.Vector3(0, 0, 0);

      if (viewMode === "interior") {
        targetAzimuth = -0.936;
        targetPolar = 0.566;
      } else {
        targetAzimuth = VIEWPOINTS_AZIMUTH[viewIndex];
        targetPolar = Math.PI * 0.35;
      }
      // Camera — polar: 0.629, azimuth: -0.775, pos: (-15.60, 30.64, 15.92)

      const currentAzimuth = controlsRef.current.getAzimuthalAngle();
      const currentPolar = controlsRef.current.getPolarAngle();
      const currentTarget = controlsRef.current.target;

      let aziDiff = targetAzimuth - currentAzimuth;
      while (aziDiff < -Math.PI) aziDiff += Math.PI * 2;
      while (aziDiff > Math.PI) aziDiff -= Math.PI * 2;

      const polDiff = targetPolar - currentPolar;
      const centerDiff = targetCenter.clone().sub(currentTarget);

      // Fire overhead callback once camera is nearly top-down
      if (
        viewMode === "interior" &&
        !overheadFired.current &&
        currentPolar < Math.PI * 0.25
      ) {
        overheadFired.current = true;
        onCameraOverhead?.();
      }

      if (
        Math.abs(aziDiff) < 0.001 &&
        Math.abs(polDiff) < 0.001 &&
        centerDiff.length() < 0.01
      ) {
        isTransitioning.current = false;
        controlsRef.current.target.set(0, 0, 0);
        return;
      }

      const lerpFactor = delta * 3;
      const newAzimuth = currentAzimuth + aziDiff * lerpFactor;
      const newPolar = currentPolar + polDiff * lerpFactor;

      controlsRef.current.target.lerp(targetCenter, lerpFactor);

      const r = distance;
      camera.position.x =
        controlsRef.current.target.x +
        r * Math.sin(newPolar) * Math.sin(newAzimuth);
      camera.position.y = controlsRef.current.target.y + r * Math.cos(newPolar);
      camera.position.z =
        controlsRef.current.target.z +
        r * Math.sin(newPolar) * Math.cos(newAzimuth);

      controlsRef.current.update();
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enableZoom={false}
      enablePan={true}
      screenSpacePanning={true}
      minPolarAngle={viewMode === "interior" ? 0.01 : (10 * Math.PI) / 180}
      maxPolarAngle={viewMode === "interior" ? Math.PI * 0.48 : Math.PI * 0.48}
      minDistance={distance}
      maxDistance={distance}
      onStart={() => {
        isTransitioning.current = false;
        if (onInteraction) onInteraction();
      }}
      makeDefault
    />
  );
}

function AnimatedModel({ url, visible = true, onLoaded }) {
  const { scene } = useGLTF(url);
  const cloned = useMemo(() => scene.clone(true), [scene]);
  const groupRef = useRef();
  const [shouldRender, setShouldRender] = useState(visible);

  useEffect(() => {
    if (cloned && onLoaded) onLoaded(cloned);
  }, [cloned, onLoaded]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    // Target Y position: 0 when visible, 2 when hidden (slides up)
    const targetY = visible ? 0 : 2;
    const targetOpacity = visible ? 1 : 0;
groupRef.current.traverse((child) => {
  if (child.isMesh) {
    child.castShadow = visible;
    child.receiveShadow = visible;
  }
});
    groupRef.current.position.y = THREE.MathUtils.lerp(
      groupRef.current.position.y,
      targetY,
      delta * 4,
    );

    // Handle actual rendering lifecycle to prevent shadows from hidden objects
    if (!visible && groupRef.current.position.y > 1.9) {
      setShouldRender(false);
    } else if (visible) {
      setShouldRender(true);
    }
  });

  return (
    <group ref={groupRef}>
      {shouldRender && <primitive object={cloned} />}
    </group>
  );
}

function Model({ url, visible = true, onLoaded }) {
  const { scene } = useGLTF(url);
  const cloned = useMemo(() => scene.clone(true), [scene]);
  useEffect(() => {
    if (cloned && onLoaded) onLoaded(cloned);
  }, [cloned, onLoaded]);
  return <primitive object={cloned} visible={visible} />;
}

const MODEL_URLS = {
  base: {
    light: `${import.meta.env.BASE_URL}base/models/newmodels/Light_Base.glb`,
    dark: `${import.meta.env.BASE_URL}base/models/newmodels/Black_Base.glb`,
  },
  roof: {
    light: `${import.meta.env.BASE_URL}base/models/newmodels/Light_Roof.glb`,
    dark: `${import.meta.env.BASE_URL}base/models/newmodels/Black_Roof.glb`,
  },
  bed: {
    Mezzanine_king: `${import.meta.env.BASE_URL}base/models/newmodels/Mezzanine King.glb`,
    Mezzanine_Bunk: `${import.meta.env.BASE_URL}base/models/newmodels/Mezzanine Bunk.glb`,
  },
  kitchen: `${import.meta.env.BASE_URL}base/models/newmodels/Kitchen.glb`,
  cabinetDoor: `${import.meta.env.BASE_URL}base/models/newmodels/Kitchen_Cabinet_Door.glb`,
  deck: `${import.meta.env.BASE_URL}base/models/newmodels/Deck.glb`,
  countertop: {
    stainless_steel: `${import.meta.env.BASE_URL}base/models/newmodels/CounterTopSteel.glb`,
    wood_island: `${import.meta.env.BASE_URL}base/models/newmodels/CounterTopWood.glb`,
  },
};


const SceneContent = ({
  viewMode,
  config,
  onHeightChange,
  onDistanceChange,
  onModelMaxSizeChange,
  modelMaxSize,
  cameraRef,
  modelHeight,
  onReady,
  roofVisible,
}) => {
  const { size, camera: threeCamera } = useThree();

  const baseUrl =
    MODEL_URLS.base[config.selectedColor] || MODEL_URLS.base.light;
  const roofUrl =
    MODEL_URLS.roof[config.selectedColor] || MODEL_URLS.roof.light;
  const bedUrl = MODEL_URLS.bed[config.selectedBed] || MODEL_URLS.bed.Mezzanine_king;
  const counterTopUrl = MODEL_URLS.countertop[config.selectedCounterTop] || MODEL_URLS.countertop.stainless_steel;
  // console.log("[SceneContent] selectedCounterTop =", config.selectedCounterTop, "→ url =", counterTopUrl);
  // Step 1: On model load, measure, cache size, and enable casting shadows on all meshes.
  const handleModelLoaded = useMemo(
    () => (scene) => {
      const box = new THREE.Box3().setFromObject(scene);
      const sizeBox = box.getSize(new THREE.Vector3());
      onHeightChange(sizeBox.y);
      onModelMaxSizeChange(Math.max(sizeBox.x, sizeBox.y, sizeBox.z));
      scene.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          // child.position.y += 0.002;
        }
      });
    },
    [onHeightChange, onModelMaxSizeChange],
  );

  const enableShadows = useCallback((scene) => {
    scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        // child.position.y += 0.02;
      }
    });
  }, []);

  // Step 2: Recalculate distance whenever canvas size OR cached model size changes.
  const readyCalled = useRef(false);
  useEffect(() => {
    if (!modelMaxSize) return;

    const aspect = size.width / size.height;
    const fov = threeCamera.fov * (Math.PI / 180);
    const fitHeightDistance = modelMaxSize / (2 * Math.tan(fov / 2));
    const fitWidthDistance = fitHeightDistance / aspect;
    const calculatedDistance =
      2.2 * Math.max(fitHeightDistance, fitWidthDistance);

    onDistanceChange(calculatedDistance);

    if (cameraRef.current) {
      const initialAzimuth = VIEWPOINTS_AZIMUTH[0];
      const initialPolar = Math.PI * 0.35;
      cameraRef.current.position.set(
        calculatedDistance * Math.sin(initialPolar) * Math.sin(initialAzimuth),
        calculatedDistance * Math.cos(initialPolar),
        calculatedDistance * Math.sin(initialPolar) * Math.cos(initialAzimuth),
      );
      cameraRef.current.lookAt(0, 0, 0);
    }

    if (!readyCalled.current) {
      readyCalled.current = true;
      onReady?.();
    }
  }, [
    modelMaxSize,
    size.width,
    size.height,
    threeCamera.fov,
    onDistanceChange,
    cameraRef,
    onReady,
  ]);

  return (
    <Suspense fallback={null}>
      {/* <group rotation={[0, Math.PI / 6, 0]}> */}
      <Center key="main-center">
        {/* Base structure — swaps by color */}
        <Model key={baseUrl} url={baseUrl} onLoaded={scene => {handleModelLoaded(scene);
          
        }} />

        {/* Roof — slides away in interior view, swaps by color */}
        <AnimatedModel
          key={roofUrl}
          url={roofUrl}
          visible={roofVisible}
          onLoaded={enableShadows}
        />

        {/* Interior models — only visible in interior view */}
        <Model
          key={bedUrl}
          url={bedUrl}
          visible={viewMode === "interior"}
          onLoaded={enableShadows}
        />
        <Model
          url={MODEL_URLS.kitchen}
          visible={viewMode === "interior"}
          onLoaded={enableShadows}
        />
        <Model
          key={counterTopUrl}
          url={counterTopUrl}
          visible={viewMode === "interior"}
          onLoaded={enableShadows}
        />
        {config.selectedCabinet === "full" && (
          <Model
            url={MODEL_URLS.cabinetDoor}
            visible={viewMode === "interior"}
            onLoaded={enableShadows}
          />
        )}
        {config.deckSelection === true && (
          <Model url={MODEL_URLS.deck} onLoaded={enableShadows} />
        )}
      </Center>
      {/* </group> */}

      <ContactShadows
        position={[0, -modelHeight / 2 - 0.01, 0]}
        opacity={0.45}
        scale={60}
        blur={2.5}
        far={modelHeight * 2 || 10}
        color="#000000"
      />

      <Environment preset="city" />
    </Suspense>
  );
};

const ModelViewer = ({ viewIndex = 0, viewMode = "exterior", config = {} }) => {
  const cameraRef = useRef();
  const [cameraDistance, setCameraDistance] = useState(30);
  const [modelMaxSize, setModelMaxSize] = useState(null);
  const [modelHeight, setModelHeight] = useState(0);
  const [modelReady, setModelReady] = useState(false);
  const [roofVisible, setRoofVisible] = useState(true);

  const handleReady = useCallback(() => setModelReady(true), []);

  // When switching back to exterior, immediately show roof
  useEffect(() => {
    if (viewMode === "exterior") {
      setRoofVisible(true);
    }
  }, [viewMode]);

  // Called by CameraHandler once camera is nearly overhead during interior transition
  const handleCameraOverhead = useCallback(() => {
    setRoofVisible(false);
  }, []);

  return (
    <div className="relative w-full h-full">
      {/* Loader shown while GLB is fetching, outside Canvas so it's always visible */}
      <LoadingOverlay />

      {/* Canvas fades in once the camera is positioned — no abrupt size jump */}
      <div
        className="w-full h-full cursor-grab active:cursor-grabbing"
        style={{
          opacity: modelReady ? 1 : 0,
          transition: modelReady ? "opacity 0.75s ease-in" : "none",
        }}
      >
        <Canvas shadows dpr={[1, 2]} gl={{ logarithmicDepthBuffer: true }}>
          <PerspectiveCamera
            makeDefault
            ref={cameraRef}
            fov={17}
            near={.5}
            far={100}
          />

          <ambientLight intensity={0.7} />
          <directionalLight
            position={[10, 25, 10]}
            intensity={1.2}
            castShadow
            shadow-mapSize={2048}
          />
          <pointLight position={[-15, 15, -15]} intensity={0.5} />

          <SceneContent
            viewMode={viewMode}
            config={config}
            onHeightChange={setModelHeight}
            onDistanceChange={setCameraDistance}
            onModelMaxSizeChange={setModelMaxSize}
            modelMaxSize={modelMaxSize}
            cameraRef={cameraRef}
            modelHeight={modelHeight}
            onReady={handleReady}
            roofVisible={roofVisible}
          />

          <CameraHandler
            viewIndex={viewIndex}
            viewMode={viewMode}
            distance={cameraDistance}
            onCameraOverhead={handleCameraOverhead}
          />
        </Canvas>
      </div>
    </div>
  );
};

// Preload all models for instant switching
Object.values(MODEL_URLS.base).forEach((url) => useGLTF.preload(url));
Object.values(MODEL_URLS.roof).forEach((url) => useGLTF.preload(url));
Object.values(MODEL_URLS.bed).forEach((url) => useGLTF.preload(url));
useGLTF.preload(MODEL_URLS.kitchen);
useGLTF.preload(MODEL_URLS.cabinetDoor);
useGLTF.preload(MODEL_URLS.deck);
 Object.values(MODEL_URLS.countertop).forEach((url) => useGLTF.preload(url));

export default ModelViewer;
