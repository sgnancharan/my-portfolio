"use client";

import { Canvas } from "@react-three/fiber";
import { Preload } from "@react-three/drei";
import { Suspense, useEffect } from "react";
import { CameraController } from "@/components/canvas/CameraController";
import { CosmicNexus } from "@/components/canvas/CosmicNexus";
import { MouseParallax } from "@/components/canvas/MouseParallax";
import { OrbitalSystem } from "@/components/canvas/OrbitalSystem";
import { Spaceship } from "@/components/canvas/Spaceship";
import { StarField } from "@/components/canvas/StarField";
import { pointerState, viewportState } from "@/lib/scroll-state";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

function SceneContents({ starCount }: { starCount: number }) {
  return (
    <>
      <color attach="background" args={["#05070c"]} />
      <fog attach="fog" args={["#05070c", 12, 36]} />
      <ambientLight intensity={0.18} />
      <directionalLight position={[6, 8, 4]} intensity={0.55} color="#d7e6f2" />
      <directionalLight position={[-8, -2, -6]} intensity={0.22} color="#6d6aa3" />
      <CameraController />
      <MouseParallax>
        <StarField count={starCount} />
        <OrbitalSystem />
        <CosmicNexus />
      </MouseParallax>
      <Spaceship />
      <Preload all />
    </>
  );
}

export function SceneCanvas() {
  const reducedMotion = usePrefersReducedMotion();
  const isMobile = useMediaQuery("(max-width: 767px)");
  const starCount = isMobile ? 900 : 2200;

  useEffect(() => {
    viewportState.reducedMotion = reducedMotion;
    viewportState.isMobile = isMobile;

    const onPointer = (event: PointerEvent) => {
      pointerState.targetX = (event.clientX / window.innerWidth) * 2 - 1;
      pointerState.targetY = (event.clientY / window.innerHeight) * 2 - 1;
    };

    window.addEventListener("pointermove", onPointer, { passive: true });
    return () => window.removeEventListener("pointermove", onPointer);
  }, [isMobile, reducedMotion]);

  return (
    <Canvas
      className="h-full w-full pointer-events-auto"
      dpr={isMobile ? [1, 1.25] : [1, 1.6]}
      gl={{
        antialias: !isMobile,
        alpha: false,
        powerPreference: "high-performance",
        stencil: false,
        localClippingEnabled: true,
      }}
      camera={{ position: [0.15, 0.35, 16.4], fov: 42, near: 0.1, far: 80 }}
      frameloop="always"
      eventPrefix="client"
      aria-hidden
    >
      <Suspense fallback={null}>
        <SceneContents starCount={starCount} />
      </Suspense>
    </Canvas>
  );
}
