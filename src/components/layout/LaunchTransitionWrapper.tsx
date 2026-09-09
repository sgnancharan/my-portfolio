"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  getLaunchIntroSnapshot,
  subscribeLaunchIntro,
} from "@/lib/launch-intro-state";

export function LaunchTransitionWrapper({ children }: { children: ReactNode }) {
  const [snap, setSnap] = useState(() => getLaunchIntroSnapshot());

  useEffect(() => {
    const unsub = subscribeLaunchIntro(() => {
      setSnap(getLaunchIntroSnapshot());
    });
    return unsub;
  }, []);

  // Load hero section in background before showing on screen:
  // Preload happens in DOM behind the black wall as camera enters thrusters
  const isComplete = snap.isComplete;
  const isPreloaded = isComplete || snap.heroPreloaded || snap.cosmosLoaded > 0.5;
  const isInteractable = isComplete || snap.zipProgress >= 0.85;

  return (
    <div
      className="relative z-10 w-full"
      style={{
        display: isPreloaded ? "block" : "none",
        pointerEvents: isInteractable ? "auto" : "none",
      }}
    >
      {/* Solid Black Wall behind which website is loaded during rocket ascent */}
      {!isComplete && (
        <div
          className="fixed inset-0 z-20 bg-black pointer-events-none transition-opacity duration-300"
          style={{
            opacity: snap.orangeWall >= 0.98 ? 0 : 1,
            display: snap.orangeWall >= 0.98 && snap.zipProgress > 0.05 ? "none" : "block",
          }}
          aria-hidden
        />
      )}
      {children}
    </div>
  );
}
