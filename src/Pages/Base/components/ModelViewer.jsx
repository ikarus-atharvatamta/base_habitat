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

const ToneMappingUpdater = ({ toneMapping, toneMappingExposure, activeLightControls }) => {
  const { gl, scene } = useThree();
  
  useEffect(() => {
    const isAnyControlActive = activeLightControls && activeLightControls.length > 0;
    
    // Only apply custom tone mapping if a light control is active. Otherwise revert to defaults.
    gl.toneMapping = isAnyControlActive ? toneMapping : THREE.AgXToneMapping;
    
    if (toneMappingExposure !== undefined) {
      gl.toneMappingExposure = isAnyControlActive ? toneMappingExposure : 0.7;
    }
    
    scene.traverse((child) => {
      if (child.isMesh && child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach(m => m.needsUpdate = true);
        } else {
          child.material.needsUpdate = true;
        }
      }
    });
  }, [toneMapping, toneMappingExposure, gl, scene, activeLightControls]);
  
  return null;
};

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
      maxPolarAngle={viewMode === "interior" ? Math.PI * 0.5 : Math.PI * 0.5}
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

function AnimatedModel({ url, visible = true, onLoaded, lightSettings, activeLightControls }) {
  const { scene } = useGLTF(url);
  const cloned = useMemo(() => scene.clone(true), [scene]);
  const groupRef = useRef();
  const [shouldRender, setShouldRender] = useState(visible);
  
  const fileName = url.split('/').pop();
  const isActive = activeLightControls?.includes(fileName);

  useEffect(() => {
    if (cloned && onLoaded) onLoaded(cloned);
  }, [cloned, onLoaded]);

  useEffect(() => {
    if (cloned) {
      const lightsInfo = [];
      cloned.traverse((child) => {
        if (child.isLight) {
          if (child.userData.originalIntensity === undefined) {
            child.userData.originalIntensity = child.intensity;
          }
          if (child.userData.originalColor === undefined) {
            child.userData.originalColor = "#" + child.color.getHexString();
          }
          
          let defaultMultiplier = 1.0;
          let defaultColor = child.userData.originalColor;

          if (fileName === "Mezzanine Bunk.glb" && (child.name === "Point003" || child.name === "Point004")) {
            defaultMultiplier = 0.1;
            defaultColor = "#965027";
          } else if (fileName === "Mezzanine King.glb" && (child.name === "Point005" || child.name === "Point006")) {
            defaultMultiplier = 0.05;
            defaultColor = "#965027";
          } else if (fileName === "Black_Base.glb" || fileName === "Light_Base.glb") {
            if (["Point", "Point001", "Point002", "Point007"].includes(child.name)) {
              defaultMultiplier = 0.1;
              defaultColor = "#965027";
            } else if (["Spot", "Spot001_1"].includes(child.name)) {
              defaultMultiplier = 0.04;
              defaultColor = "#a4765b";
            } else if (child.name === "Spot002") {
              defaultMultiplier = 0.02;
              defaultColor = "#965027";
            } else if (child.name === "Spot002_1") {
              defaultMultiplier = 0.05;
              defaultColor = "#965027";
            } else if (child.name === "Sun") {
              defaultMultiplier = 0.002;
              defaultColor = "#965027";
            } else if (child.name === "Sun001") {
              defaultMultiplier = 0;
              defaultColor = "#965027";
            } else {
              defaultColor = "#965027";
            }
          }
          
          const lightId = child.name || child.uuid;
          
          console.log(`[DEBUG] Processing light in ${fileName}:`, {
            id: lightId,
            name: child.name,
            defaultMultiplier,
            defaultColor,
          });

          lightsInfo.push({
            id: lightId,
            name: child.name || child.type,
            type: child.type,
            defaultIntensity: child.userData.originalIntensity,
            defaultMultiplier: defaultMultiplier,
            defaultColor: defaultColor,
            defaultDistance: child.distance || 0,
          });

          const userIntensity = lightSettings?.[fileName]?.[lightId]?.intensity;
          const userColor = lightSettings?.[fileName]?.[lightId]?.color;
          const userRange = lightSettings?.[fileName]?.[lightId]?.range;

          if (isActive && userIntensity !== undefined) {
            child.intensity = child.userData.originalIntensity * userIntensity;
          } else {
            child.intensity = child.userData.originalIntensity * defaultMultiplier;
          }
          
          if (isActive && userColor) {
            child.color.set(userColor);
          } else {
            child.color.set(defaultColor);
          }
          
          if (child.distance !== undefined) {
            if (isActive && userRange !== undefined) {
              child.distance = userRange;
            } else {
              child.distance = child.userData.originalDistance || 0;
            }
          }
        }
      });
      
      if (!window.__MODEL_LIGHTS__) window.__MODEL_LIGHTS__ = {};
      window.__MODEL_LIGHTS__[fileName] = lightsInfo;
      window.dispatchEvent(new CustomEvent('model-lights-updated', { detail: { fileName, lightsInfo } }));
    }
  }, [cloned, lightSettings, fileName, isActive]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    // Target Y position: 0 when visible, 2 when hidden (slides up)
    const targetY = visible ? 0 : 2;
    const targetOpacity = visible ? 1 : 0;
    // groupRef.current.traverse((child) => {
    //   if (child.isMesh) {
    //     child.castShadow = visible;
    //     child.receiveShadow = visible;
    //   }
    // });
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

function Model({ url, visible = true, onLoaded, lightSettings, activeLightControls }) {
  const { scene } = useGLTF(url);
  const cloned = useMemo(() => scene.clone(true), [scene]);
  useEffect(() => {
    if (cloned && onLoaded) onLoaded(cloned);
  }, [cloned, onLoaded]);
  
  const fileName = url.split('/').pop();
  const isActive = activeLightControls?.includes(fileName);

  useEffect(() => {
    if (cloned) {
      const lightsInfo = [];
      cloned.traverse((child) => {
        if (child.isLight) {
          if (child.userData.originalIntensity === undefined) {
            child.userData.originalIntensity = child.intensity;
          }
          if (child.userData.originalColor === undefined) {
            child.userData.originalColor = "#" + child.color.getHexString();
          }
          
          let defaultMultiplier = 1.0;
          let defaultColor = child.userData.originalColor;

          if (fileName === "Mezzanine Bunk.glb" && (child.name === "Point003" || child.name === "Point004")) {
            defaultMultiplier = 0.1;
            defaultColor = "#965027";
          } else if (fileName === "Mezzanine King.glb" && (child.name === "Point005" || child.name === "Point006")) {
            defaultMultiplier = 0.05;
            defaultColor = "#965027";
          } else if (fileName === "Black_Base.glb" || fileName === "Light_Base.glb") {
            if (["Point", "Point001", "Point002", "Point007"].includes(child.name)) {
              defaultMultiplier = 0.1;
              defaultColor = "#965027";
            } else if (["Spot", "Spot001_1"].includes(child.name)) {
              defaultMultiplier = 0.04;
              defaultColor = "#a4765b";
            } else if (child.name === "Spot002") {
              defaultMultiplier = 0.02;
              defaultColor = "#965027";
            } else if (child.name === "Spot002_1") {
              defaultMultiplier = 0.05;
              defaultColor = "#965027";
            } else if (child.name === "Sun") {
              defaultMultiplier = 0.002;
              defaultColor = "#965027";
            } else if (child.name === "Sun001") {
              defaultMultiplier = 0;
              defaultColor = "#965027";
            } else {
              defaultColor = "#965027";
            }
          }
          
          const lightId = child.name || child.uuid;
          lightsInfo.push({
            id: lightId,
            name: child.name || child.type,
            type: child.type,
            defaultIntensity: child.userData.originalIntensity,
            defaultMultiplier: defaultMultiplier,
            defaultColor: defaultColor,
            defaultDistance: child.distance || 0,
          });

          const userIntensity = lightSettings?.[fileName]?.[lightId]?.intensity;
          const userColor = lightSettings?.[fileName]?.[lightId]?.color;
          const userRange = lightSettings?.[fileName]?.[lightId]?.range;

          if (isActive && userIntensity !== undefined) {
            child.intensity = child.userData.originalIntensity * userIntensity;
          } else {
            child.intensity = child.userData.originalIntensity * defaultMultiplier;
          }
          
          if (isActive && userColor) {
            child.color.set(userColor);
          } else {
            child.color.set(defaultColor);
          }
          
          if (child.distance !== undefined) {
            if (isActive && userRange !== undefined) {
              child.distance = userRange;
            } else {
              child.distance = child.userData.originalDistance || 0;
            }
          }
        }
      });

      if (!window.__MODEL_LIGHTS__) window.__MODEL_LIGHTS__ = {};
      window.__MODEL_LIGHTS__[fileName] = lightsInfo;
      window.dispatchEvent(new CustomEvent('model-lights-updated', { detail: { fileName, lightsInfo } }));
    }
  }, [cloned, lightSettings, fileName, isActive]);

  return <primitive object={cloned} visible={visible} />;
}

const MODEL_URLS = {
  base_ext: {
    light: `${import.meta.env.BASE_URL}base/models/model-7oct26/Light_Base.glb`,
    dark: `${import.meta.env.BASE_URL}base/models/model-7oct26/Black_Base.glb`,
  },
  base_int: {
    dark: `${import.meta.env.BASE_URL}base/models/model-7oct26/Black_Base.glb`,
    light: `${import.meta.env.BASE_URL}base/models/model-7oct26/Light_Base.glb`,
  },
  roof: {
    light: `${import.meta.env.BASE_URL}base/models/model-7oct26/Light_Roof.glb`,
    dark: `${import.meta.env.BASE_URL}base/models/model-7oct26/Black_Roof.glb`,
  },
  bed: {
    Mezzanine_king: `${import.meta.env.BASE_URL}base/models/model-7oct26/Mezzanine King.glb`,
    Mezzanine_Bunk: `${import.meta.env.BASE_URL}base/models/model-7oct26/Mezzanine Bunk.glb`,
  },
  kitchen: `${import.meta.env.BASE_URL}base/models/model-7oct26/Kitchen.glb`,
  cabinetDoor: `${import.meta.env.BASE_URL}base/models/model-7oct26/Kitchen_Cabinet_Door.glb`,
  deck: `${import.meta.env.BASE_URL}base/models/model-7oct26/Deck.glb`,
  countertop: {
    stainless_steel: `${import.meta.env.BASE_URL}base/models/model-7oct26/CounterTopSteel.glb`,
    wood_island: `${import.meta.env.BASE_URL}base/models/model-7oct26/CounterTopWood.glb`,
  },
  window: {
    "wood-pvc": `${import.meta.env.BASE_URL}base/models/model-7oct26/Wood_Window.glb`,
    "galvanized-aluminium": `${import.meta.env.BASE_URL}base/models/model-7oct26/Alumininum_Window.glb`,
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

  const baseUrl_int =
    MODEL_URLS.base_int[config.sidingColor] || MODEL_URLS.base_int.light;
  const baseUrl_ext =
    MODEL_URLS.base_ext[config.sidingColor] || MODEL_URLS.base_ext.light;
  const baseUrl = viewMode === "interior" ? baseUrl_int : baseUrl_ext;
  const roofUrl =
    MODEL_URLS.roof[config.roofColor] || MODEL_URLS.roof.light;
  const bedUrl = MODEL_URLS.bed[config.selectedBed] || MODEL_URLS.bed.Mezzanine_king;
  const counterTopUrl = MODEL_URLS.countertop[config.selectedCounterTop] || MODEL_URLS.countertop.stainless_steel;
  const windowUrl = MODEL_URLS.window[config.windowMaterial] || MODEL_URLS.window["wood-pvc"];
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
    const baseDistance = 2.2 * Math.max(fitHeightDistance, fitWidthDistance);
    const calculatedDistance = viewMode === "interior" ? baseDistance * 0.85 : baseDistance;

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
    viewMode,
  ]);

  return (
    <Suspense fallback={null}>
      {/* <group rotation={[0, Math.PI / 6, 0]}> */}
      <Center key="main-center">
        {/* Base structure — dynamically loads based on viewMode and color */}
        <Model 
          key={baseUrl} 
          url={baseUrl}
          visible={true}
          onLoaded={handleModelLoaded} 
          lightSettings={config.lightSettings}
          activeLightControls={config.activeLightControls}
        />

        {/* Roof — slides away in interior view, swaps by color */}
        <AnimatedModel
          key={roofUrl}
          url={roofUrl}
          visible={roofVisible}
          onLoaded={enableShadows}
          lightSettings={config.lightSettings}
          activeLightControls={config.activeLightControls}
        />

        {/* Interior models — visible in both views (shows through windows/doors) */}
        <Model
          key={bedUrl}
          url={bedUrl}
          visible={true}
          onLoaded={enableShadows}
          lightSettings={config.lightSettings}
          activeLightControls={config.activeLightControls}
        />
        <Model
          url={MODEL_URLS.kitchen}
          visible={true}
          onLoaded={enableShadows}
          lightSettings={config.lightSettings}
          activeLightControls={config.activeLightControls}
        />
        <Model
          key={counterTopUrl}
          url={counterTopUrl}
          visible={true}
          onLoaded={enableShadows}
          lightSettings={config.lightSettings}
          activeLightControls={config.activeLightControls}
        />
        {config.selectedCabinet === "full" && (
          <Model
            url={MODEL_URLS.cabinetDoor}
            visible={true}
            onLoaded={enableShadows}
            lightSettings={config.lightSettings}
            activeLightControls={config.activeLightControls}
          />
        )}
        {config.deckSelection === true && (
          <Model url={MODEL_URLS.deck} onLoaded={enableShadows} lightSettings={config.lightSettings} activeLightControls={config.activeLightControls} />
        )}
        <Model
          key={windowUrl}
          url={windowUrl}
          onLoaded={enableShadows}
          lightSettings={config.lightSettings}
          activeLightControls={config.activeLightControls}
        />
      </Center>
      {/* </group> */}

      <ContactShadows
        position={[0, -modelHeight / 2 -0.16, 0]}
        opacity={0.35}
        scale={60}
        blur={2.5}
        far={modelHeight * 2 || 10}
        color="#000000"
        // scale={50}
      />

      <Environment
      // preset="city"
       files={`${import.meta.env.BASE_URL}environment/neutral.hdr`} 
       />

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

  const handleHeightChange = useCallback((height) => {
    setModelHeight((prev) => {
      if (Math.abs(prev - height) < 0.001) return prev;
      return height;
    });
  }, []);

  const handleMaxSizeChange = useCallback((size) => {
    setModelMaxSize((prev) => {
      if (prev !== null && Math.abs(prev - size) < 0.001) return prev;
      return size;
    });
  }, []);

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
        <Canvas shadows dpr={[1, 2]} 
        gl={{ 
          toneMapping: config.toneMapping !== undefined ? parseInt(config.toneMapping) : THREE.AgXToneMapping, }}

        >
          {/* <Stage> */}
          <ToneMappingUpdater 
            toneMapping={config.toneMapping !== undefined ? parseInt(config.toneMapping) : THREE.AgXToneMapping} 
            toneMappingExposure={config.toneMappingExposure !== undefined ? parseFloat(config.toneMappingExposure) : 0.7}
            activeLightControls={config.activeLightControls}
          />
          <PerspectiveCamera
            makeDefault
            ref={cameraRef}
            fov={17}    
            near={.5}
            far={100}
          />

           <ambientLight intensity={0.7} />
           
            
          
          {/* <directionalLight
            position={[10, 25, 10]}
            intensity={1.2}
            castShadow
            shadow-mapSize={2048}
          /> */}
          {/* <pointLight position={[-15, 15, -15]} intensity={0.5} /> */}

          <SceneContent
            viewMode={viewMode}
            config={config}
            onHeightChange={handleHeightChange}
            onDistanceChange={setCameraDistance}
            onModelMaxSizeChange={handleMaxSizeChange}
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
Object.values(MODEL_URLS.base_int).forEach((url) => useGLTF.preload(url));
Object.values(MODEL_URLS.base_ext).forEach((url) => useGLTF.preload(url));

Object.values(MODEL_URLS.roof).forEach((url) => useGLTF.preload(url));
Object.values(MODEL_URLS.bed).forEach((url) => useGLTF.preload(url));
useGLTF.preload(MODEL_URLS.kitchen);
useGLTF.preload(MODEL_URLS.cabinetDoor);
useGLTF.preload(MODEL_URLS.deck);
Object.values(MODEL_URLS.countertop).forEach((url) => useGLTF.preload(url));

export default ModelViewer;
