"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { PerspectiveCamera, Vector3 } from "three";
import { sampleCameraPath } from "@/lib/camera-path";
import { getLaunchIntroSnapshot } from "@/lib/launch-intro-state";
import { scrollState, viewportState } from "@/lib/scroll-state";

export function CameraController() {
  const look = useRef(new Vector3());
  const pos = useRef(new Vector3());
  const launchLook = useRef(new Vector3());
  const launchPos = useRef(new Vector3());

  useFrame((state, delta) => {
    const snap = getLaunchIntroSnapshot();
    const isMobile = viewportState.isMobile;
    const mobileScale = isMobile ? 0.82 : 1;
    const reduced = viewportState.reducedMotion;
    const cam = state.camera;

    // Normal Hero & Scroll Target Pose
    const heroTarget = sampleCameraPath(scrollState.progress);
    const heroPos = new Vector3(
      heroTarget.position[0] * mobileScale,
      heroTarget.position[1],
      heroTarget.position[2]
    );
    const heroLook = new Vector3(
      heroTarget.lookAt[0],
      heroTarget.lookAt[1],
      heroTarget.lookAt[2]
    );
    const heroFov = heroTarget.fov;

    // ========================================================
    // 1. CINEMATIC ISRO LAUNCH CAMERA MODE
    // ========================================================
    if (snap.isActive && !snap.isComplete) {
      const t = state.clock.elapsedTime;
      const rY = snap.rocketY;
      const zoom = snap.thrusterZoom ?? 0;
      const wall = snap.orangeWall ?? 0;
      const shakeIntensity = reduced ? 0 : snap.cameraShake;

      // Subtle atmospheric vibration during ignition & ascent
      const shakeX = (Math.sin(t * 55) + Math.cos(t * 85)) * 0.035 * shakeIntensity;
      const shakeY = (Math.cos(t * 60) + Math.sin(t * 95)) * 0.035 * shakeIntensity;

      // 1. Station Pad Base Coordinates
      const stationCamX = (0.2 + shakeX) * mobileScale;
      const stationCamY = -1.2 + shakeY;
      const stationCamZ = 9.8;
      const stationLookY = 2.0;
      const stationFov = 46;

      // 2. Continuous Tracking Coordinates as rocket ascends
      const trackCamX = (0.2 * (1 - zoom * 0.5) + shakeX) * mobileScale;
      const trackCamY = stationCamY + rY * 0.38;
      const trackCamZ = stationCamZ;
      const trackLookY = stationLookY + rY * 0.55;

      // 3. Inside Thruster Coordinates (camera dives right under engine bells into fire plume)
      const nozzleCamX = 0 + shakeX * (1 - zoom);
      const nozzleCamY = rY - 3.2;
      const nozzleCamZ = 0.6;
      const nozzleLookY = rY - 2.8;
      const nozzleFov = 56;

      // Single C1-continuous Hermite smoothstep curve for zooming from station into inside thruster
      const sZoom = zoom * zoom * (3 - 2 * zoom);

      let targetCamX = trackCamX * (1 - sZoom) + nozzleCamX * sZoom;
      let targetCamY = trackCamY * (1 - sZoom) + nozzleCamY * sZoom;
      let targetCamZ = trackCamZ * (1 - sZoom) + nozzleCamZ * sZoom;
      let targetLookY = trackLookY * (1 - sZoom) + nozzleLookY * sZoom;
      let targetFov = stationFov * (1 - sZoom) + nozzleFov * sZoom;

      // When the orange screen wall covers the viewport (or in transition/unzip),
      // seamlessly lock camera to the Hero target pose behind the opaque wall
      if (
        wall >= 0.95 ||
        snap.phase === "TRANSITION" ||
        snap.zipProgress > 0 ||
        snap.heroReveal > 0.5
      ) {
        targetCamX = heroPos.x;
        targetCamY = heroPos.y;
        targetCamZ = heroPos.z;
        targetLookY = heroLook.y;
        targetFov = heroFov;

        // While opaque orange wall covers screen or during unzipping, lock camera directly to hero pose
        if (wall >= 0.98 || snap.zipProgress > 0) {
          cam.position.copy(heroPos);
          cam.lookAt(heroLook);
          if (cam instanceof PerspectiveCamera) {
            cam.fov = heroFov;
            cam.updateProjectionMatrix();
          }
          return;
        }
      }

      // Silky smooth camera interpolation
      const damp = reduced ? 1 : 1 - Math.exp(-5.5 * delta);
      launchPos.current.set(targetCamX, targetCamY, targetCamZ);
      launchLook.current.set(0, targetLookY, 0);

      cam.position.lerp(launchPos.current, damp);
      cam.lookAt(launchLook.current);

      if (cam instanceof PerspectiveCamera) {
        cam.fov += (targetFov - cam.fov) * damp;
        cam.updateProjectionMatrix();
      }
      return;
    }

    // ========================================================
    // 2. NORMAL PORTFOLIO CAMERA MODE (Hero -> About -> Space)
    // ========================================================
    const damp = reduced ? 1 : 1 - Math.exp(-3.4 * delta);
    pos.current.copy(heroPos);
    look.current.copy(heroLook);

    cam.position.lerp(pos.current, damp);
    cam.lookAt(look.current);

    if (cam instanceof PerspectiveCamera) {
      cam.fov += (heroFov - cam.fov) * damp;
      cam.updateProjectionMatrix();
    }
  });

  return null;
}
