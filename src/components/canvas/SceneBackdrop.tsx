"use client";

import dynamic from "next/dynamic";
import { useWebGLSupport } from "@/hooks/useWebGLSupport";

const SceneCanvas = dynamic(
  () => import("@/components/canvas/SceneCanvas").then((mod) => mod.SceneCanvas),
  { ssr: false, loading: () => <div className="scene-fallback h-full w-full" /> },
);

export function SceneBackdrop() {
  const webgl = useWebGLSupport();

  return (
    <div className="pointer-events-none fixed inset-0 z-0" aria-hidden>
      {webgl ? <SceneCanvas /> : <div className="scene-fallback h-full w-full" />}
    </div>
  );
}
