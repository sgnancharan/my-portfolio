"use client";

import { Canvas } from "@react-three/fiber";
import { Preload } from "@react-three/drei";
import { Suspense, useEffect, useState } from "react";
import { CameraController } from "@/components/canvas/CameraController";
import { CosmicNexus } from "@/components/canvas/CosmicNexus";
import { IsroLaunchComplex } from "@/components/canvas/IsroLaunchComplex";
import { MouseParallax } from "@/components/canvas/MouseParallax";
import { OrbitalSystem } from "@/components/canvas/OrbitalSystem";
import { Spaceship } from "@/components/canvas/Spaceship";
import { StarField } from "@/components/canvas/StarField";
import { getLaunchIntroSnapshot, subscribeLaunchIntro } from "@/lib/launch-intro-state";
import { pointerState, viewportState } from "@/lib/scroll-state";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { useTheme } from "@/components/providers/ThemeProvider";

function SceneContents({ starCount }: { starCount: number }) {
  const { theme } = useTheme();
  const [snap, setSnap] = useState(() => getLaunchIntroSnapshot());

  useEffect(() => {
    const unsub = subscribeLaunchIntro(() => {
      setSnap(getLaunchIntroSnapshot());
    });
    return unsub;
  }, []);

  // Preload background cosmos behind the orange wall as camera enters thruster
  const showCosmos = snap.isComplete || snap.heroPreloaded || snap.cosmosLoaded > 0.5;
  const isLight = theme === "light";

  const bgColor = isLight ? "#f4f7fb" : "#05070c";
  const fogNear = isLight ? 16 : 12;
  const fogFar = isLight ? 48 : 36;

  return (
    <>
      <color attach="background" args={[bgColor]} />
      <fog attach="fog" args={[bgColor, fogNear, fogFar]} />
      <ambientLight intensity={isLight ? 0.75 : 0.18} />
      <directionalLight
        position={[8, 12, 6]}
        intensity={isLight ? 1.15 : 0.55}
        color={isLight ? "#ffffff" : "#d7e6f2"}
      />
      <directionalLight
        position={[-8, -2, -6]}
        intensity={isLight ? 0.45 : 0.22}
        color={isLight ? "#94a3b8" : "#6d6aa3"}
      />
      <CameraController />
      <IsroLaunchComplex />
      {showCosmos && (
        <>
          <MouseParallax>
            <StarField count={starCount} />
            <OrbitalSystem />
            <CosmicNexus />
          </MouseParallax>
          <Spaceship />
        </>
      )}
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
