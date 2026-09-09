"use client";

import { useMemo } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

interface OrangeZipTearOverlayProps {
  orangeWall: number; // 0..1 radiant orange screen coverage
  zipProgress: number; // 0..1 tears from bottom middle and separates like zip without zipper
}

export function OrangeZipTearOverlay({
  orangeWall,
  zipProgress,
}: OrangeZipTearOverlayProps) {
  const isReduced = usePrefersReducedMotion();

  // Compute curved unzipping clip-paths for Left and Right flaps
  const { leftClipPath, rightClipPath, vertexYPercent, showVertexSpark } =
    useMemo(() => {
      const p = Math.max(0, Math.min(1, zipProgress));

      // Reduced motion fallback: no tearing clip-path, simple fade
      if (isReduced || p === 0) {
        return {
          leftClipPath: "none",
          rightClipPath: "none",
          vertexYPercent: 100,
          showVertexSpark: false,
        };
      }

      // 1. Tear Apex (Vertex) moves upward from bottom (100%) to top (0%)
      // Reaches top at p = 0.85
      const vertexY = p < 0.85 ? Math.max(0, 100 - (p / 0.85) * 100) : 0;

      // 2. Lateral separation spread increases with p
      const spread = Math.min(2.2, p * 1.95);

      // Generate curved points along the unzipping opening (t from 0 to 1)
      // Exponential curve for organic trumpet-bell zipper flare
      const sampleCount = 6;
      const leftCurvePoints: string[] = [];
      const rightCurvePoints: string[] = [];

      for (let i = 0; i <= sampleCount; i++) {
        const t = i / sampleCount;
        const y = (vertexY + (100 - vertexY) * t).toFixed(2);
        const curveT = Math.pow(t, 1.45);
        const offsetPercent = curveT * spread * 100;

        // Left flap (inner edge at local x = 100%)
        const leftX = (100 - offsetPercent).toFixed(2);
        leftCurvePoints.push(`${leftX}% ${y}%`);

        // Right flap (inner edge at local x = 0%)
        const rightX = offsetPercent.toFixed(2);
        rightCurvePoints.push(`${rightX}% ${y}%`);
      }

      // Assemble Left Flap polygon:
      // Top-left (0% 0%) -> Top-right (100% 0%) -> Down along center to vertex ->
      // Follow curve to bottom -> Bottom-left (0% 100%)
      const leftPoly = `polygon(0% 0%, 100% 0%, 100% ${vertexY.toFixed(
        2
      )}%, ${leftCurvePoints.join(", ")}, 0% 100%)`;

      // Assemble Right Flap polygon:
      // Top-left (0% 0%) -> Down along center to vertex -> Follow curve to bottom ->
      // Bottom-right (100% 100%) -> Top-right (100% 0%)
      const rightPoly = `polygon(0% 0%, 0% ${vertexY.toFixed(
        2
      )}%, ${rightCurvePoints.join(", ")}, 100% 100%, 100% 0%)`;

      return {
        leftClipPath: leftPoly,
        rightClipPath: rightPoly,
        vertexYPercent: vertexY,
        showVertexSpark: p > 0.02 && p < 0.92,
      };
    }, [zipProgress, isReduced]);

  // Outward translation & slight rotation of panels as they separate
  const p = Math.max(0, Math.min(1, zipProgress));
  const leftTranslateX = isReduced ? 0 : -(p * 32);
  const leftRotate = isReduced ? 0 : -(p * 5.5);

  const rightTranslateX = isReduced ? 0 : p * 32;
  const rightRotate = isReduced ? 0 : p * 5.5;

  // If wall has not started or is complete, unmount to save 100% GPU
  if (orangeWall <= 0.001 && zipProgress <= 0) {
    return null;
  }

  // Fade out as flaps clear the screen near the end of the unzipping
  const panelOpacity =
    orangeWall *
    (zipProgress >= 0.75
      ? Math.max(0, 1 - (zipProgress - 0.75) / 0.25)
      : 1);

  return (
    <div
      className="fixed inset-0 z-[60] pointer-events-none overflow-hidden select-none"
      style={{
        opacity: panelOpacity,
        display: panelOpacity > 0.002 ? "block" : "none",
      }}
      aria-hidden
    >
      {/* ========================================================
          1. LEFT FLAP (Covers screen left to center: 0% to 50vw + 1px)
          Tears leftward from bottom middle
          ======================================================== */}
      <div
        className="absolute top-0 bottom-0 left-0 w-[calc(50vw+1px)] overflow-hidden"
        style={{
          clipPath: leftClipPath,
          transform: `translate3d(${leftTranslateX}vw, 0, 0) rotate(${leftRotate}deg)`,
          transformOrigin: "top left",
          willChange: "clip-path, transform",
        }}
      >
        {/* Solid Void Black Backing Layer (Guarantees zero light leakage) */}
        <div className="absolute inset-0 bg-[#05070c]" />

        {/* Radiant Orange Thruster Plasma Base */}
        <div
          className="absolute -inset-10"
          style={{
            background:
              "radial-gradient(ellipse at 100% 50%, #ff5500 0%, #ff6e00 25%, #ea580c 50%, #c2410c 80%, #7c2d12 100%)",
          }}
        />

        {/* Blazing Incandescent Core of the Thruster */}
        <div
          className="absolute -inset-10"
          style={{
            background:
              "radial-gradient(circle at 100% 50%, rgba(255, 255, 255, 0.98) 0%, rgba(254, 215, 170, 0.95) 20%, rgba(251, 146, 60, 0.9) 45%, rgba(234, 88, 12, 0.8) 75%, transparent 100%)",
            mixBlendMode: "screen",
          }}
        />

        {/* Volumetric Thermal Plasma Texture */}
        <div
          className="absolute -inset-20 opacity-80"
          style={{
            background:
              "radial-gradient(circle at 80% 40%, rgba(255, 237, 213, 0.85) 0%, transparent 45%), radial-gradient(circle at 60% 60%, rgba(254, 186, 116, 0.85) 0%, transparent 45%)",
            filter: "blur(40px)",
          }}
        />

        {/* Glowing Burning Energy Seam along the Torn Edge */}
        {zipProgress > 0 && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              boxShadow: "inset -8px 0 25px rgba(255, 255, 255, 0.5), inset -16px 0 45px rgba(251, 146, 60, 0.8)",
            }}
          />
        )}
      </div>

      {/* ========================================================
          2. RIGHT FLAP (Covers screen center to right: 50vw to 100vw)
          Tears rightward from bottom middle
          ======================================================== */}
      <div
        className="absolute top-0 bottom-0 left-[50vw] w-[calc(50vw+1px)] overflow-hidden"
        style={{
          clipPath: rightClipPath,
          transform: `translate3d(${rightTranslateX}vw, 0, 0) rotate(${rightRotate}deg)`,
          transformOrigin: "top right",
          willChange: "clip-path, transform",
        }}
      >
        {/* Solid Void Black Backing Layer */}
        <div className="absolute inset-0 bg-[#05070c]" />

        {/* Radiant Orange Thruster Plasma Base */}
        <div
          className="absolute -inset-10"
          style={{
            background:
              "radial-gradient(ellipse at 0% 50%, #ff5500 0%, #ff6e00 25%, #ea580c 50%, #c2410c 80%, #7c2d12 100%)",
          }}
        />

        {/* Blazing Incandescent Core of the Thruster */}
        <div
          className="absolute -inset-10"
          style={{
            background:
              "radial-gradient(circle at 0% 50%, rgba(255, 255, 255, 0.98) 0%, rgba(254, 215, 170, 0.95) 20%, rgba(251, 146, 60, 0.9) 45%, rgba(234, 88, 12, 0.8) 75%, transparent 100%)",
            mixBlendMode: "screen",
          }}
        />

        {/* Volumetric Thermal Plasma Texture */}
        <div
          className="absolute -inset-20 opacity-80"
          style={{
            background:
              "radial-gradient(circle at 20% 40%, rgba(255, 237, 213, 0.85) 0%, transparent 45%), radial-gradient(circle at 40% 60%, rgba(254, 186, 116, 0.85) 0%, transparent 45%)",
            filter: "blur(40px)",
          }}
        />

        {/* Glowing Burning Energy Seam along the Torn Edge */}
        {zipProgress > 0 && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              boxShadow: "inset 8px 0 25px rgba(255, 255, 255, 0.5), inset 16px 0 45px rgba(251, 146, 60, 0.8)",
            }}
          />
        )}
      </div>

      {/* ========================================================
          3. INCANDESCENT SIZZLING TEAR APEX (The Unzipping Energy Vertex)
          Tears from bottom center (x: 50vw, y: 100vh) upwards to top (y: 0vh)
          ======================================================== */}
      {showVertexSpark && (
        <div
          className="fixed pointer-events-none z-[65] -translate-x-1/2 -translate-y-1/2"
          style={{
            left: "50vw",
            top: `${vertexYPercent}vh`,
            willChange: "top",
          }}
        >
          {/* Intense Thermal Flare Core */}
          <div className="relative flex items-center justify-center">
            {/* Pulsing White-Hot Spark */}
            <div className="h-5 w-5 rounded-full bg-white shadow-[0_0_20px_#ffffff,0_0_40px_#ff9900,0_0_80px_#ff4400] animate-pulse" />

            {/* Horizontal Plasma Ray */}
            <div className="absolute h-1 w-24 bg-gradient-to-r from-transparent via-amber-200 to-transparent blur-[1px]" />

            {/* Vertical Seam Ignition Needle */}
            <div className="absolute w-1 h-20 bg-gradient-to-b from-transparent via-orange-400 to-transparent blur-[1px]" />

            {/* Radiant Thermal Corona */}
            <div className="absolute h-16 w-16 rounded-full bg-amber-400/30 blur-md animate-ping" />
          </div>
        </div>
      )}

      {/* ========================================================
          4. ENERGETIC TORN EDGE SEAM GLOW (SVG Overlay)
          Visualizes burning energetic tear contours
          ======================================================== */}
      {zipProgress > 0.01 && zipProgress < 0.88 && (
        <svg
          className="fixed inset-0 w-full h-full pointer-events-none z-[62]"
          preserveAspectRatio="none"
          viewBox="0 0 100 100"
        >
          <defs>
            <linearGradient id="tearFireGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
              <stop offset="30%" stopColor="#fde047" stopOpacity="0.8" />
              <stop offset="70%" stopColor="#f97316" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#ea580c" stopOpacity="0.2" />
            </linearGradient>
            <filter id="tearGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Left Flap Energetic Contour Line */}
          <path
            d={`M 50 0 L 50 ${vertexYPercent} Q ${
              50 - Math.min(48, zipProgress * 30)
            } ${vertexYPercent + (100 - vertexYPercent) * 0.55} ${
              50 - Math.min(48, zipProgress * 55)
            } 100`}
            fill="none"
            stroke="url(#tearFireGrad)"
            strokeWidth="0.8"
            filter="url(#tearGlow)"
            opacity={0.85}
          />

          {/* Right Flap Energetic Contour Line */}
          <path
            d={`M 50 0 L 50 ${vertexYPercent} Q ${
              50 + Math.min(48, zipProgress * 30)
            } ${vertexYPercent + (100 - vertexYPercent) * 0.55} ${
              50 + Math.min(48, zipProgress * 55)
            } 100`}
            fill="none"
            stroke="url(#tearFireGrad)"
            strokeWidth="0.8"
            filter="url(#tearGlow)"
            opacity={0.85}
          />
        </svg>
      )}
    </div>
  );
}
