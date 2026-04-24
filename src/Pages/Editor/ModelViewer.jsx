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
  useProgress,
  ContactShadows,
} from "@react-three/drei";
import * as THREE from "three";
import { X, Upload } from "lucide-react";

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


function DynamicModel({ url, visible = true, onLoaded }) {
  const { scene } = useGLTF(url);
  const cloned = useMemo(() => scene.clone(true), [scene]);

  useEffect(() => {
    if (cloned && onLoaded) onLoaded(cloned);
  }, [cloned, onLoaded]);

  return <primitive object={cloned} visible={visible} />;
}

const SceneContent = ({
  modelUrls = [],
  onHeightChange,
  onDistanceChange,
  onModelMaxSizeChange,
  modelMaxSize,
  cameraRef,
  modelHeight,
  onReady,
}) => {
  const { size, camera: threeCamera } = useThree();
  const handleModelLoaded = useCallback(
    (scene) => {
      const box = new THREE.Box3().setFromObject(scene);
      const sizeBox = box.getSize(new THREE.Vector3());
      onHeightChange(sizeBox.y);
      onModelMaxSizeChange(Math.max(sizeBox.x, sizeBox.y, sizeBox.z));
      scene.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
    },
    [onHeightChange, onModelMaxSizeChange],
  );

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
      const initialAzimuth = Math.PI * 0.25;
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
      <Center key="main-center">
        {modelUrls.map((url, idx) => (
          <DynamicModel key={url} url={url} onLoaded={handleModelLoaded} />
        ))}
      </Center>

      <ContactShadows
        position={[0, -modelHeight / 2 - 0.01, 0]}
        opacity={0.45}
        scale={60}
        blur={2.5}
        far={modelHeight * 2 || 10}
        color="#000000"
      />

      <Environment files={`${import.meta.env.BASE_URL}environment/neutral.hdr`} />
    </Suspense>
  );
};

const ModelViewer = () => {
  const cameraRef = useRef();
  const containerRef = useRef();
  const [cameraDistance, setCameraDistance] = useState(30);
  const [modelMaxSize, setModelMaxSize] = useState(null);
  const [modelHeight, setModelHeight] = useState(0);
  const [modelReady, setModelReady] = useState(false);
  const [modelUrls, setModelUrls] = useState([]);
  const [isDragging, setIsDragging] = useState(false);

  const handleReady = useCallback(() => setModelReady(true), []);

  const handleFileLoad = useCallback((file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const blob = new Blob([e.target.result], { type: file.type });
      const url = URL.createObjectURL(blob);
      setModelUrls((prev) => [...prev, url]);
    };
    reader.readAsArrayBuffer(file);
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      files.forEach((file) => {
        if (
          file.type === "application/octet-stream" ||
          file.name.endsWith(".glb") ||
          file.name.endsWith(".gltf")
        ) {
          handleFileLoad(file);
        }
      });
    },
    [handleFileLoad],
  );

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const removeModel = useCallback((url) => {
    setModelUrls((prev) => prev.filter((u) => u !== url));
    URL.revokeObjectURL(url);
  }, []);

  const handleFileInput = useCallback(
    (e) => {
      const files = Array.from(e.target.files || []);
      files.forEach((file) => {
        if (
          file.type === "application/octet-stream" ||
          file.name.endsWith(".glb") ||
          file.name.endsWith(".gltf")
        ) {
          handleFileLoad(file);
        }
      });
    },
    [handleFileLoad],
  );

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <LoadingOverlay />

      {modelUrls.length === 0 && (
        <div
          className={`absolute inset-0 z-20 flex flex-col items-center justify-center pointer-events-none transition-all ${
            isDragging
              ? "bg-black/10 backdrop-blur-sm pointer-events-auto"
              : "bg-transparent"
          }`}
        >
          <div className="flex flex-col items-center gap-4">
            <Upload
              size={48}
              className={`transition-all ${
                isDragging ? "text-charcoal scale-110" : "text-charcoal/40"
              }`}
            />
            <div className="text-center">
              <p
                className={`text-lg font-medium transition-all ${
                  isDragging
                    ? "text-charcoal"
                    : "text-charcoal/60 group-hover:text-charcoal"
                }`}
              >
                {isDragging ? "Drop your model here" : "Drag and drop GLB/GLTF files"}
              </p>
              <p className="text-sm text-charcoal/40 mt-2">or</p>
              <label className="mt-3 inline-block">
                <input
                  type="file"
                  multiple
                  accept=".glb,.gltf"
                  onChange={handleFileInput}
                  className="hidden"
                />
                <span className="px-4 py-2 bg-charcoal text-white rounded-lg cursor-pointer hover:bg-charcoal/90 transition-colors inline-block">
                  Browse files
                </span>
              </label>
            </div>
          </div>
        </div>
      )}

      <div
        className="w-full h-full cursor-grab active:cursor-grabbing"
        style={{
          opacity: modelReady ? 1 : 0,
          transition: modelReady ? "opacity 0.75s ease-in" : "none",
        }}
      >
        <Canvas shadows dpr={[1, 2]} gl={{ toneMapping: THREE.NoToneMapping }}>
          <PerspectiveCamera
            makeDefault
            ref={cameraRef}
            fov={17}
            near={0.5}
            far={100}
          />

          <ambientLight intensity={0.1} />

          <SceneContent
            modelUrls={modelUrls}
            onHeightChange={setModelHeight}
            onDistanceChange={setCameraDistance}
            onModelMaxSizeChange={setModelMaxSize}
            modelMaxSize={modelMaxSize}
            cameraRef={cameraRef}
            modelHeight={modelHeight}
            onReady={handleReady}
          />

          <EditorCameraHandler distance={cameraDistance} />
        </Canvas>
      </div>

      {modelUrls.length > 0 && (
        <div className="absolute top-4 right-4 z-30 flex flex-col gap-2 max-w-xs">
          {modelUrls.map((url, idx) => (
            <div
              key={url}
              className="bg-white/90 backdrop-blur-md px-3 py-2 rounded-lg shadow-sm border border-black/5 flex items-center justify-between gap-3"
            >
              <span className="text-sm text-charcoal truncate">Model {idx + 1}</span>
              <button
                onClick={() => removeModel(url)}
                className="p-1 text-charcoal/60 hover:text-charcoal transition-colors"
                title="Remove model"
              >
                <X size={16} />
              </button>
            </div>
          ))}
          <label className="mt-2">
            <input
              type="file"
              multiple
              accept=".glb,.gltf"
              onChange={handleFileInput}
              className="hidden"
            />
            <span className="w-full px-3 py-2 bg-charcoal text-white rounded-lg cursor-pointer hover:bg-charcoal/90 transition-colors inline-block text-center text-sm">
              Add more models
            </span>
          </label>
        </div>
      )}
    </div>
  );
};

function EditorCameraHandler({ distance }) {
  const { camera } = useThree();
  const controlsRef = useRef();

  useFrame(() => {
    if (!controlsRef.current) return;
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enableZoom={true}
      enablePan={true}
      screenSpacePanning={true}
      minDistance={distance * 0.5}
      maxDistance={distance * 2}
      makeDefault
    />
  );
}

export default ModelViewer;
