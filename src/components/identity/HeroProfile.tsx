"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { identityNodes, PROFILE_PHOTO } from "@/data/identity-nodes";
import { profile } from "@/data/profile";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import {
  hoverIdentity,
  identityInteraction,
  openIdentity,
  subscribeIdentity,
} from "@/lib/identity-state";
import { scrollState } from "@/lib/scroll-state";
import type { IdentityNodeId } from "@/types";

interface NodePosition {
  x: number;
  y: number;
}

// Protected layout coordinates ensuring ZERO overlap with photo (center) or title (below)
const DESKTOP_POSITIONS: Record<string, NodePosition> = {
  "local-ai": { x: -215, y: -70 },
  web: { x: 0, y: -155 },
  aiml: { x: 215, y: -70 },
  server: { x: -245, y: +30 },
  debugger: { x: 245, y: +30 },
};

const MOBILE_POSITIONS: Record<string, NodePosition> = {
  "local-ai": { x: -96, y: -95 },
  web: { x: 0, y: -116 },
  aiml: { x: 96, y: -95 },
  server: { x: -106, y: +15 },
  debugger: { x: 106, y: +15 },
};

export function HeroProfile() {
  const reduced = usePrefersReducedMotion();
  const isMobile = useMediaQuery("(max-width: 767px)");

  const containerRef = useRef<HTMLDivElement>(null);
  const tiltGroupRef = useRef<HTMLDivElement>(null);
  const coreRef = useRef<HTMLButtonElement>(null);

  const [activeNodeId, setActiveNodeId] = useState<IdentityNodeId | null>(null);

  useEffect(() => {
    const unsub = subscribeIdentity(() => {
      setActiveNodeId(identityInteraction.hovered);
    });
    return () => {
      unsub();
    };
  }, []);

  // Independent Animation System (Mouse 3D tilt, floating, breathing, scroll damping)
  useEffect(() => {
    if (reduced) return;

    let animId: number;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    const onPointerMove = (e: MouseEvent) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight * 0.35;
      targetX = (e.clientX - cx) / (window.innerWidth / 2);
      targetY = (e.clientY - cy) / (window.innerHeight / 2);
    };

    window.addEventListener("mousemove", onPointerMove, { passive: true });

    const startTime = performance.now();

    let targetScroll = 0;
    let currentScroll = 0;

    const loop = (now: number) => {
      const elapsed = now - startTime;

      // Smooth inertia lerp for 3D mouse tilt
      currentX += (targetX - currentX) * 0.05;
      currentY += (targetY - currentY) * 0.05;

      const tiltY = currentX * (isMobile ? 5 : 10);
      const tiltX = -currentY * (isMobile ? 4 : 8);

      // Independent periodic organic float
      const floatY = Math.sin(elapsed * 0.0016) * (isMobile ? 2.5 : 4.5);

      // Smooth continuous scroll tracking: zero popping or discrete jumps
      targetScroll = scrollState.scroll || window.scrollY || 0;
      currentScroll += (targetScroll - currentScroll) * 0.08;

      // Ultra-smooth, gradual cubic fade across the exit of Hero into About
      const heroHeight = window.innerHeight || 800;
      const scrollRatio = Math.min(1, Math.max(0, currentScroll / (heroHeight * 0.72)));
      const scrollOpacity = Math.max(0, 1 - scrollRatio * scrollRatio);
      const scrollYOffset = -currentScroll * 0.08;

      if (tiltGroupRef.current) {
        tiltGroupRef.current.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(${floatY + scrollYOffset}px)`;
        tiltGroupRef.current.style.opacity = String(scrollOpacity);
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("mousemove", onPointerMove);
    };
  }, [isMobile, reduced]);

  const positions = isMobile ? MOBILE_POSITIONS : DESKTOP_POSITIONS;
  const isCoreHovered = activeNodeId === "core";

  const triggerActivation = (id: IdentityNodeId, target: HTMLElement) => {
    const box = target.getBoundingClientRect();
    openIdentity(id, box.left + box.width / 2, box.top + box.height / 2);
  };

  return (
    <div
      ref={containerRef}
      className="relative mx-auto flex w-full max-w-4xl items-center justify-center select-none"
      style={{
        height: isMobile ? "270px" : "360px",
        perspective: "1000px",
      }}
    >
      {/* 3D Parallax Tilt Group */}
      <div
        ref={tiltGroupRef}
        className="relative flex h-full w-full items-center justify-center will-change-transform"
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* SVG Dynamic Laser Connection Lines (Centered at 0,0) */}
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
          viewBox={isMobile ? "-180 -140 360 280" : "-450 -190 900 380"}
          preserveAspectRatio="xMidYMid meet"
          aria-hidden
        >
          <defs>
            <filter id="hero-laser-glow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {identityNodes.map((node) => {
            const pos = positions[node.id] || { x: 0, y: 0 };
            const isActive = activeNodeId === node.id;

            return (
              <g key={node.id}>
                {/* Base dashed line */}
                <line
                  x1="0"
                  y1="0"
                  x2={pos.x}
                  y2={pos.y}
                  stroke={node.color}
                  strokeWidth="1.2"
                  strokeDasharray="4 6"
                  strokeOpacity={isActive ? "0.85" : isCoreHovered ? "0.45" : "0.14"}
                  className="transition-all duration-300"
                />
                {/* Active energized laser beam */}
                {(isActive || isCoreHovered) && (
                  <line
                    x1="0"
                    y1="0"
                    x2={pos.x}
                    y2={pos.y}
                    stroke={node.color}
                    strokeWidth={isActive ? "2.6" : "1.6"}
                    strokeLinecap="round"
                    filter="url(#hero-laser-glow)"
                    strokeOpacity={isActive ? "1" : "0.75"}
                    className="transition-all duration-200"
                  />
                )}
              </g>
            );
          })}
        </svg>

        {/* 1. CENTRAL IDENTITY PHOTO (FACE & CORE OPERATOR) */}
        <button
          ref={coreRef}
          type="button"
          aria-label="S Gnan Charan - Central Identity Core. Click to open operator dossier."
          aria-haspopup="dialog"
          aria-expanded={identityInteraction.open === "core"}
          aria-controls="identity-modal"
          className="group relative z-20 flex items-center justify-center rounded-full cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 touch-manipulation"
          style={{
            width: isMobile ? "134px" : "205px",
            height: isMobile ? "134px" : "205px",
            transform: "translateZ(30px)",
          }}
          onPointerEnter={() => hoverIdentity("core")}
          onPointerLeave={() => hoverIdentity(null)}
          onFocus={() => hoverIdentity("core")}
          onBlur={() => hoverIdentity(null)}
          onClick={(e) => triggerActivation("core", e.currentTarget)}
        >
          {/* Holographic Concentric Rings */}
          <div
            className="pointer-events-none absolute -inset-3 rounded-full border border-dashed border-cyan-300/30 transition-colors duration-500 group-hover:border-cyan-300/80"
            style={{
              animation: reduced ? "none" : "spin 36s linear infinite",
            }}
          />
          <div className="pointer-events-none absolute -inset-1.5 rounded-full border border-cyan-400/40 group-hover:border-cyan-300 group-hover:shadow-[0_0_30px_rgba(56,189,248,0.4)] transition-all duration-300" />

          {/* Holographic Corner Reticle Brackets */}
          <span className="hud-bracket hud-bracket-tl" aria-hidden />
          <span className="hud-bracket hud-bracket-tr" aria-hidden />
          <span className="hud-bracket hud-bracket-bl" aria-hidden />
          <span className="hud-bracket hud-bracket-br" aria-hidden />

          {/* Real Profile Photo Container (Clear, Crisp, 1:1 Framing) */}
          <div className="relative h-full w-full overflow-hidden rounded-full border-2 border-cyan-200/50 bg-[#040812] shadow-[0_0_40px_rgba(56,189,248,0.3)] group-hover:shadow-[0_0_55px_rgba(56,189,248,0.55)] transition-shadow duration-300">
            <Image
              src={PROFILE_PHOTO}
              alt={`${profile.name} - Systems & AI operator in server laboratory`}
              width={640}
              height={800}
              priority
              unoptimized
              className="h-full w-full object-cover object-center"
            />
            {/* Front Sheen Lens */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-cyan-500/10 via-transparent to-white/10 opacity-70 group-hover:opacity-90 transition-opacity duration-300" />
          </div>

          {/* Interactive Floating Micro-HUD Badge below photo */}
          <div
            className="pointer-events-none absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-cyan-400/40 bg-slate-950/90 px-3 py-0.5 backdrop-blur-md transition-all duration-300 group-hover:-translate-y-1 group-hover:border-cyan-300 group-hover:shadow-[0_0_16px_rgba(56,189,248,0.4)]"
            style={{ transform: "translateX(-50%) translateZ(45px)" }}
          >
            <span className="font-mono text-[8.5px] uppercase tracking-[0.22em] text-cyan-200 font-medium">
              OPERATOR CORE // {isCoreHovered ? "CLICK FOR DOSSIER" : "ONLINE"}
            </span>
          </div>
        </button>

        {/* 2. THE 5 FLOATING ROLE NODES (Protected Clearance, NEVER covering face or title) */}
        {identityNodes.map((node) => {
          const pos = positions[node.id] || { x: 0, y: 0 };
          const isActive = activeNodeId === node.id;

          return (
            <button
              key={node.id}
              type="button"
              className="identity-node group absolute z-30 touch-manipulation cursor-pointer"
              style={{
                transform: `translate3d(${pos.x}px, ${pos.y}px, 42px)`,
                ["--node-color" as string]: node.color,
              }}
              aria-haspopup="dialog"
              aria-expanded={identityInteraction.open === node.id}
              aria-controls="identity-modal"
              aria-label={`${node.label} node - ${node.kicker}. Click to view details and visualization.`}
              data-active={isActive ? "true" : "false"}
              data-core-linked={isCoreHovered ? "true" : "false"}
              onPointerEnter={() => hoverIdentity(node.id)}
              onPointerLeave={() => hoverIdentity(null)}
              onFocus={() => hoverIdentity(node.id)}
              onBlur={() => hoverIdentity(null)}
              onClick={(e) => triggerActivation(node.id, e.currentTarget)}
            >
              <span className="identity-node-dot" aria-hidden />
              <div className="flex flex-col items-start text-left">
                <span className="identity-node-label">{node.label}</span>
                <span className="identity-node-kicker">{node.kicker}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
