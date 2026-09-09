"use client";

import { useMemo } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

interface OrangeZipTearOverlayProps {
  orangeWall: number; // 0..1 radiant orange screen coverage
  zipProgress: number; // 0..1 opens from bottom outward 0 degree to 180 degree
}

export function OrangeZipTearOverlay({
  orangeWall,
  zipProgress,
}: OrangeZipTearOverlayProps) {
  const isReduced = usePrefersReducedMotion();

  // Compute exact 0° to 180° opening angle geometry opening from the bottom
  const {
    leftClipPath,
    rightClipPath,
    pLeft,
    pRight,
    showTear,
    isFullyOpen,
  } = useMemo(() => {
    const p = Math.max(0, Math.min(1, zipProgress));

    // Reduced motion or before tear starts: full screen cover
    if (isReduced || p <= 0) {
      return {
        leftClipPath: "polygon(0% 0%, 50% 0%, 50% 100%, 0% 100%)",
        rightClipPath: "polygon(50% 0%, 100% 0%, 100% 100%, 50% 100%)",
        pLeft: { x: 50, y: 100 },
        pRight: { x: 50, y: 100 },
        showTear: false,
        isFullyOpen: false,
      };
    }

    // Opening angle: 0° to 180°
    // Half-angle phi: 0° to 90° (measured from downward vertical)
    // Opens from the bottom upward as an inverted V (Λ)
    const phiRad = (p * 90 * Math.PI) / 180;
    const tanPhi = Math.tan(phiRad);

    // Critical threshold where rays hit the bottom corners (50 / 100 = 0.5)
    // When tan(phi) <= 0.5, rays intersect the BOTTOM edge (y = 100%)
    // When tan(phi) > 0.5, rays intersect the SIDE edges (x = 0 and x = 100)
    let leftPoly: string;
    let rightPoly: string;
    let ptLeft: { x: number; y: number };
    let ptRight: { x: number; y: number };

    if (tanPhi <= 0.5001) {
      // Rays intersect the bottom edge at y = 100% (revealing the hero section from bottom)
      const xLeft = Math.max(0, 50 - 100 * tanPhi);
      const xRight = Math.min(100, 50 + 100 * tanPhi);

      ptLeft = { x: xLeft, y: 100 };
      ptRight = { x: xRight, y: 100 };

      leftPoly = `polygon(0% 0%, 50% 0%, ${xLeft.toFixed(3)}% 100%, 0% 100%)`;
      rightPoly = `polygon(50% 0%, 100% 0%, 100% 100%, ${xRight.toFixed(3)}% 100%)`;
    } else {
      // Rays intersect the side edges at x = 0 (left) and x = 100 (right)
      // As phi -> 90° (180° total flat line), ySide -> 0% (top corners)
      const ySide = Math.min(100, Math.max(0, 50 / tanPhi));

      ptLeft = { x: 0, y: ySide };
      ptRight = { x: 100, y: ySide };

      leftPoly = `polygon(0% 0%, 50% 0%, 0% ${ySide.toFixed(3)}%)`;
      rightPoly = `polygon(50% 0%, 100% 0%, 100% ${ySide.toFixed(3)}%)`;
    }

    return {
      leftClipPath: leftPoly,
      rightClipPath: rightPoly,
      pLeft: ptLeft,
      pRight: ptRight,
      showTear: p > 0.005 && p < 0.995,
      isFullyOpen: p >= 0.985,
    };
  }, [zipProgress, isReduced]);

  // If wall has not started, or is fully opened to 180°, unmount completely
  if (orangeWall <= 0.001 || isFullyOpen) {
    return null;
  }

  // Fade out smoothly right as it reaches 180° so it cleanly disappears
  const panelOpacity =
    orangeWall *
    (zipProgress >= 0.85
      ? Math.max(0, 1 - (zipProgress - 0.85) / 0.15)
      : 1);

  if (panelOpacity <= 0.002) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[60] pointer-events-none overflow-hidden select-none"
      style={{
        opacity: panelOpacity,
      }}
      aria-hidden
    >
      {/* ========================================================
          1. LEFT ORANGE PLASMA FLAP (Opens from bottom outward 0° to 90°)
          ======================================================== */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{
          clipPath: leftClipPath,
          willChange: "clip-path",
        }}
      >
        <div className="absolute inset-0 bg-[#05070c]" />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 50% 50%, #ff5500 0%, #ff6e00 20%, #ea580c 50%, #c2410c 80%, #7c2d12 100%)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.98) 0%, rgba(254, 215, 170, 0.95) 20%, rgba(251, 146, 60, 0.9) 45%, rgba(234, 88, 12, 0.8) 75%, transparent 100%)",
            mixBlendMode: "screen",
          }}
        />
        <div
          className="absolute -inset-20 opacity-80"
          style={{
            background:
              "radial-gradient(circle at 35% 40%, rgba(255, 237, 213, 0.85) 0%, transparent 45%), radial-gradient(circle at 65% 60%, rgba(254, 186, 116, 0.85) 0%, transparent 45%)",
            filter: "blur(40px)",
          }}
        />
      </div>

      {/* ========================================================
          2. RIGHT ORANGE PLASMA FLAP (Opens from bottom outward 0° to 90°)
          ======================================================== */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{
          clipPath: rightClipPath,
          willChange: "clip-path",
        }}
      >
        <div className="absolute inset-0 bg-[#05070c]" />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 50% 50%, #ff5500 0%, #ff6e00 20%, #ea580c 50%, #c2410c 80%, #7c2d12 100%)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.98) 0%, rgba(254, 215, 170, 0.95) 20%, rgba(251, 146, 60, 0.9) 45%, rgba(234, 88, 12, 0.8) 75%, transparent 100%)",
            mixBlendMode: "screen",
          }}
        />
        <div
          className="absolute -inset-20 opacity-80"
          style={{
            background:
              "radial-gradient(circle at 35% 40%, rgba(255, 237, 213, 0.85) 0%, transparent 45%), radial-gradient(circle at 65% 60%, rgba(254, 186, 116, 0.85) 0%, transparent 45%)",
            filter: "blur(40px)",
          }}
        />
      </div>

      {/* ========================================================
          3. GLOWING THERMAL TEARING EDGES (0° to 180° Inverted V Rays)
          ======================================================== */}
      {showTear && (
        <svg
          className="fixed inset-0 w-full h-full pointer-events-none z-[62]"
          preserveAspectRatio="none"
          viewBox="0 0 100 100"
        >
          <defs>
            <linearGradient id="rayGrad" x1="50%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
              <stop offset="25%" stopColor="#fde047" stopOpacity="0.9" />
              <stop offset="70%" stopColor="#f97316" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#ea580c" stopOpacity="0.4" />
            </linearGradient>
            <filter id="rayGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Left Ray from Apex (50, 0) to pLeft */}
          <line
            x1="50"
            y1="0"
            x2={pLeft.x}
            y2={pLeft.y}
            stroke="url(#rayGrad)"
            strokeWidth="0.85"
            filter="url(#rayGlow)"
          />

          {/* Right Ray from Apex (50, 0) to pRight */}
          <line
            x1="50"
            y1="0"
            x2={pRight.x}
            y2={pRight.y}
            stroke="url(#rayGrad)"
            strokeWidth="0.85"
            filter="url(#rayGlow)"
          />
        </svg>
      )}

      {/* ========================================================
          4. CENTRAL THERMAL ORIGIN SPARK (Top Center Apex)
          ======================================================== */}
      {showTear && (
        <div
          className="fixed pointer-events-none z-[65] -translate-x-1/2 -translate-y-1/2"
          style={{
            left: "50vw",
            top: "0vh",
          }}
        >
          <div className="relative flex items-center justify-center">
            <div className="h-6 w-6 rounded-full bg-white shadow-[0_0_20px_#ffffff,0_0_40px_#ffaa00,0_0_80px_#ff4400] animate-pulse" />
            <div className="absolute h-14 w-14 rounded-full bg-amber-400/30 blur-md" />
          </div>
        </div>
      )}
    </div>
  );
}
