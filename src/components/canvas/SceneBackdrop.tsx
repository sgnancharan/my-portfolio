"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useWebGLSupport } from "@/hooks/useWebGLSupport";
import { getLaunchIntroSnapshot, subscribeLaunchIntro } from "@/lib/launch-intro-state";

const SceneCanvas = dynamic(
  () => import("@/components/canvas/SceneCanvas").then((mod) => mod.SceneCanvas),
  { ssr: false, loading: () => <div className="scene-fallback h-full w-full" /> },
);

export function SceneBackdrop() {
  const webgl = useWebGLSupport();
  const [snap, setSnap] = useState(() => getLaunchIntroSnapshot());

  useEffect(() => {
    const unsub = subscribeLaunchIntro(() => {
      setSnap(getLaunchIntroSnapshot());
    });
    return unsub;
  }, []);

  // During launch intro, canvas is at z-30 in front of the preloaded website (z-10).
  // When orange wall fills 100% of viewport, it drops to z-0 behind the website.
  const isIntroLaunch = !snap.isComplete && snap.orangeWall < 0.98;

  return (
    <div
      className={`pointer-events-none fixed inset-0 transition-[z-index] ${
        isIntroLaunch ? "z-30" : "z-0"
      }`}
      aria-hidden
    >
      {webgl ? <SceneCanvas /> : <div className="scene-fallback h-full w-full" />}
    </div>
  );
}
