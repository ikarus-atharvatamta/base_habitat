import * as THREE from "three";
import { useGLTF } from "@react-three/drei";

/**
 * Detects if the current device is mobile or tablet with restricted WebGL memory.
 */
export const isMobileDevice = () => {
  if (typeof window === "undefined") return false;
  const ua = navigator.userAgent || "";
  const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
  const isTouchScreen = "ontouchstart" in window || navigator.maxTouchPoints > 0;
  const isSmallScreen = window.innerWidth <= 768;
  return isMobileUA || (isTouchScreen && isSmallScreen);
};

/**
 * Traverses a model scene and optimizes textures and shadows for mobile.
 * Uses a persistent `tex.userData.isOptimized` flag so textures are downscaled and uploaded
 * EXACTLY ONCE, preventing re-upload spikes and crash loops on option toggles.
 */
export const optimizeModelForMobile = (scene, isMobile, maxDim = 1024) => {
  if (!scene) return;

  scene.traverse((child) => {
    if (child.isMesh) {
      if (isMobile) {
        child.castShadow = false;
        child.receiveShadow = false;
      } else {
        child.castShadow = true;
        child.receiveShadow = true;
      }

      if (child.material) {
        const materials = Array.isArray(child.material) ? child.material : [child.material];
        materials.forEach((mat) => {
          const textureSlots = [
            "map",
            "normalMap",
            "roughnessMap",
            "metalnessMap",
            "aoMap",
            "emissiveMap",
            "bumpMap",
            "alphaMap",
          ];

          textureSlots.forEach((slot) => {
            const tex = mat[slot];
            if (tex && tex.isTexture) {
              // Skip if this texture has already been optimized to prevent duplicate work and memory re-allocations
              if (tex.userData && tex.userData.isOptimized) {
                return;
              }
              tex.userData.isOptimized = true;

              if (isMobile) {
                // Lower anisotropy to save GPU memory bandwidth on mobile
                if (tex.anisotropy) tex.anisotropy = 1;

                // Downscale large textures (e.g. 2K/4K) using a temporary 2D canvas
                if (tex.image) {
                  const img = tex.image;
                  const w = img.width || 0;
                  const h = img.height || 0;

                  if (w > maxDim || h > maxDim) {
                    try {
                      const aspect = w / h;
                      let targetW = maxDim;
                      let targetH = maxDim;
                      if (aspect >= 1) {
                        targetH = Math.max(1, Math.round(maxDim / aspect));
                      } else {
                        targetW = Math.max(1, Math.round(maxDim * aspect));
                      }

                      const canvas = document.createElement("canvas");
                      canvas.width = targetW;
                      canvas.height = targetH;
                      const ctx = canvas.getContext("2d");
                      if (ctx) {
                        ctx.drawImage(img, 0, 0, targetW, targetH);
                        tex.image = canvas;
                        tex.needsUpdate = true;
                      }
                    } catch (err) {
                      console.warn("[MobileOptimization] Could not downscale texture:", err);
                    }
                  }
                }
              }
            }
          });
        });
      }
    }
  });
};

/**
 * Safely cleans up cloned objects when an individual model unmounts inside the viewer.
 * NOTE: Does NOT dispose shared textures because they remain cached in useGLTF.
 */
export const disposeClonedScene = (cloned) => {
  if (!cloned) return;
  // Let Three.js / R3F garbage collect cloned hierarchy without invalidating shared textures
};

/**
 * Disposes all geometries, materials, and textures across an entire scene graph when leaving a page.
 */
export const disposeSceneHierarchy = (scene) => {
  if (!scene) return;
  scene.traverse((child) => {
    if (child.isMesh) {
      if (child.geometry && child.geometry.dispose) {
        child.geometry.dispose();
      }
      if (child.material) {
        const materials = Array.isArray(child.material) ? child.material : [child.material];
        materials.forEach((mat) => {
          [
            "map",
            "normalMap",
            "roughnessMap",
            "metalnessMap",
            "aoMap",
            "emissiveMap",
            "bumpMap",
            "alphaMap",
          ].forEach((prop) => {
            if (mat[prop] && mat[prop].isTexture && mat[prop].dispose) {
              mat[prop].dispose();
            }
          });
          if (mat.dispose) mat.dispose();
        });
      }
    }
  });
};

/**
 * Clears useGLTF memory cache and THREE.Cache for all models to free heap and GPU buffers.
 */
export const clearModelCache = (modelUrls) => {
  if (!modelUrls) return;
  const extractUrls = (obj) => {
    let urls = [];
    for (const val of Object.values(obj)) {
      if (typeof val === "string") urls.push(val);
      else if (typeof val === "object" && val !== null) urls.push(...extractUrls(val));
    }
    return urls;
  };
  const urls = extractUrls(modelUrls);
  urls.forEach((url) => {
    try {
      useGLTF.clear(url);
    } catch (e) {
      // Ignore URL if not loaded
    }
  });
  if (THREE.Cache) {
    THREE.Cache.clear();
  }
};
