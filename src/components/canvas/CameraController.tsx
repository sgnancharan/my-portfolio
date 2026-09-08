"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { PerspectiveCamera, Vector3 } from "three";
import { sampleCameraPath } from "@/lib/camera-path";
import { scrollState, viewportState } from "@/lib/scroll-state";

export function CameraController() {
  const look = useRef(new Vector3());
  const pos = useRef(new Vector3());

  useFrame((state, delta) => {
    const next = sampleCameraPath(scrollState.progress);
    const damp = viewportState.reducedMotion ? 1 : 1 - Math.exp(-3.4 * delta);
    const mobileScale = viewportState.isMobile ? 0.82 : 1;
    const cam = state.camera;

    pos.current.set(
      next.position[0] * mobileScale,
      next.position[1],
      next.position[2],
    );
    look.current.set(next.lookAt[0], next.lookAt[1], next.lookAt[2]);

    cam.position.lerp(pos.current, damp);
    cam.lookAt(look.current);

    if (cam instanceof PerspectiveCamera) {
      cam.fov += (next.fov - cam.fov) * damp;
      cam.updateProjectionMatrix();
    }
  });

  return null;
}
