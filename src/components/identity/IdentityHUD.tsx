"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useSyncExternalStore } from "react";
import { identityNodes, PROFILE_PHOTO } from "@/data/identity-nodes";
import { profile } from "@/data/profile";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { useWebGLSupport } from "@/hooks/useWebGLSupport";
import {
  closeIdentity,
  hoverIdentity,
  identityInteraction,
  identityLayout,
  openIdentity,
  subscribeIdentity,
} from "@/lib/identity-state";
import { IdentityModal } from "@/components/identity/IdentityModal";
import type { IdentityNodeId } from "@/types";

function getIdentitySnapshot() {
  return `${identityInteraction.hovered ?? "_"}:${identityInteraction.open ?? "_"}`;
}

export function IdentityHUD() {
  const webgl = useWebGLSupport();
  const reduced = usePrefersReducedMotion();
  const live = useId();
  const root = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const coreRef = useRef<HTMLButtonElement>(null);
  const nodeRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const paths = useRef<Record<string, SVGPathElement | null>>({});
  const activePaths = useRef<Record<string, SVGPathElement | null>>({});
  const photonRefs = useRef<Record<string, SVGCircleElement | null>>({});

  useSyncExternalStore(subscribeIdentity, getIdentitySnapshot, () => "_:_");

  useEffect(() => {
    let remove = () => {};
    let active = true;

    void import("@/lib/gsap-client").then(({ getGsap }) => {
      if (!active) return;
      const { gsap } = getGsap();

      let phase = 0;

      const tick = () => {
        const el = root.current;
        if (!el) return;

        phase += 0.035;

        const opacity = webgl ? identityLayout.opacity : 1;
        const interactive = opacity > 0.12 && !identityInteraction.open;
        el.style.opacity = String(opacity);
        el.dataset.reduced = reduced ? "true" : "false";

        const isMobile = window.innerWidth < 768;
        const cx = window.innerWidth / 2;
        const cy = window.innerHeight * 0.42;
        const fallbackR = Math.min(window.innerWidth, window.innerHeight) * (isMobile ? 0.32 : 0.28);

        const coreX = webgl && identityLayout.ready ? identityLayout.core.x : cx;
        const coreY = webgl && identityLayout.ready ? identityLayout.core.y : cy;

        // Position central identity photo interactive trigger
        if (coreRef.current) {
          const coreDiameter = isMobile ? 150 : 205;
          coreRef.current.style.transform = `translate3d(${coreX - coreDiameter / 2}px, ${coreY - coreDiameter / 2}px, 0)`;
          coreRef.current.style.width = `${coreDiameter}px`;
          coreRef.current.style.height = `${coreDiameter}px`;
          coreRef.current.style.pointerEvents = interactive ? "auto" : "none";
          coreRef.current.tabIndex = interactive ? 0 : -1;
          const isCoreSelected =
            identityInteraction.hovered === "core" ||
            identityInteraction.focused === "core" ||
            identityInteraction.open === "core";
          coreRef.current.dataset.active = isCoreSelected ? "true" : "false";
        }

        const place = (node: HTMLElement | null, x: number, y: number, width: number) => {
          if (!node) return;
          node.style.transform = `translate3d(${x - width / 2}px, ${y - 22}px, 0)`;
        };

        const hoveredNode = identityInteraction.hovered;
        const isCoreActive = hoveredNode === "core";

        // Position peripheral nodes & connecting beams
        identityNodes.forEach((node) => {
          const slot = identityLayout.nodes[node.id];
          const x =
            webgl && identityLayout.ready
              ? slot.x
              : cx + Math.cos(node.angle) * fallbackR;
          const y =
            webgl && identityLayout.ready
              ? slot.y
              : cy + Math.sin(node.angle) * fallbackR * 0.78;

          place(nodeRefs.current[node.id], x, y, isMobile ? 140 : 168);

          // Connecting lines
          const path = paths.current[node.id];
          const activePath = activePaths.current[node.id];
          const photon = photonRefs.current[node.id];

          const isNodeActive = hoveredNode === node.id || identityInteraction.open === node.id;
          const dStr = `M ${coreX} ${coreY} L ${x} ${y}`;

          if (path) {
            path.setAttribute("d", dStr);
            path.setAttribute("stroke-opacity", isNodeActive ? "0.85" : isCoreActive ? "0.45" : "0.14");
          }

          if (activePath) {
            activePath.setAttribute("d", dStr);
            activePath.setAttribute(
              "stroke-opacity",
              isNodeActive ? "1" : isCoreActive ? "0.75" : "0",
            );
            activePath.setAttribute(
              "stroke-width",
              isNodeActive ? "2.4" : isCoreActive ? "1.6" : "0.5",
            );
          }

          // Traveling photon packet animation along line
          if (photon && !reduced) {
            if (isNodeActive || isCoreActive) {
              const prog = (Math.sin(phase * 1.6 + node.phase) * 0.5 + 0.5);
              const px = coreX + (x - coreX) * prog;
              const py = coreY + (y - coreY) * prog;
              photon.setAttribute("cx", String(px));
              photon.setAttribute("cy", String(py));
              photon.setAttribute("opacity", isNodeActive ? "1" : "0.7");
            } else {
              photon.setAttribute("opacity", "0");
            }
          }
        });

        // Set interactivity states on node buttons
        identityNodes.forEach((node) => {
          const button = nodeRefs.current[node.id];
          if (!button) return;
          button.style.pointerEvents = interactive ? "auto" : "none";
          button.tabIndex = interactive ? 0 : -1;
          const selected =
            hoveredNode === node.id ||
            identityInteraction.focused === node.id ||
            identityInteraction.open === node.id;
          button.dataset.active = selected ? "true" : "false";
          button.dataset.coreLinked = isCoreActive ? "true" : "false";
        });
      };

      gsap.ticker.add(tick);
      tick();
      remove = () => gsap.ticker.remove(tick);
    });

    return () => {
      active = false;
      remove();
    };
  }, [reduced, webgl]);

  function activate(id: IdentityNodeId, target: HTMLElement) {
    const box = target.getBoundingClientRect();
    openIdentity(id, box.left + box.width / 2, box.top + box.height / 2);
  }

  const activeNode = identityNodes.find(
    (n) => n.id === identityInteraction.hovered,
  );

  return (
    <>
      <div
        ref={root}
        className="pointer-events-none fixed inset-0 z-40"
        data-identity-hud
        aria-hidden={false}
      >
        {/* SVG Laser Connection Overlay */}
        <svg
          ref={svg}
          className="pointer-events-none absolute inset-0 h-full w-full"
          aria-hidden
        >
          <defs>
            <filter id="hud-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {identityNodes.map((node) => (
            <g key={node.id}>
              {/* Subtle base dashed vector line */}
              <path
                ref={(el) => {
                  paths.current[node.id] = el;
                }}
                stroke={node.color}
                strokeWidth="1"
                strokeDasharray="4 6"
                fill="none"
              />
              {/* Energized laser beam */}
              <path
                ref={(el) => {
                  activePaths.current[node.id] = el;
                }}
                stroke={node.color}
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
                filter="url(#hud-glow)"
              />
              {/* Traveling photon packet */}
              <circle
                ref={(el) => {
                  photonRefs.current[node.id] = el;
                }}
                r="3.5"
                fill={node.color}
                filter="url(#hud-glow)"
                opacity="0"
              />
            </g>
          ))}
        </svg>

        {/* Screen Reader Live Region */}
        <p id={live} className="sr-only" aria-live="polite">
          {identityInteraction.hovered === "core"
            ? "Central identity core active: S Gnan Charan, Systems & AI Operator. 5 peripheral vectors linked."
            : identityInteraction.hovered
              ? `${activeNode?.label} node selected. Connected to identity core.`
              : "Identity core of the system. Central operator photo with five floating nodes: AI/ML, Debugger, Web Developer, Server Manager, Local AI."}
        </p>

        {/* Central Photo Trigger / Holographic Reticle */}
        <button
          ref={coreRef}
          type="button"
          aria-label="S Gnan Charan - Central Identity Core. Click to open operator dossier."
          aria-haspopup="dialog"
          aria-expanded={identityInteraction.open === "core"}
          aria-controls="identity-modal"
          className="identity-core-trigger group absolute left-0 top-0 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 touch-manipulation"
          onPointerEnter={() => hoverIdentity("core")}
          onPointerLeave={() => hoverIdentity(null)}
          onFocus={() => {
            identityInteraction.focused = "core";
            hoverIdentity("core");
          }}
          onBlur={() => {
            identityInteraction.focused = null;
            hoverIdentity(null);
          }}
          onClick={(event) => activate("core", event.currentTarget)}
        >
          {/* Holographic Reticle Corner Brackets */}
          <span className="hud-bracket hud-bracket-tl" aria-hidden />
          <span className="hud-bracket hud-bracket-tr" aria-hidden />
          <span className="hud-bracket hud-bracket-bl" aria-hidden />
          <span className="hud-bracket hud-bracket-br" aria-hidden />

          {/* Fallback Photo for Non-WebGL */}
          {!webgl ? (
            <div className="absolute inset-0 overflow-hidden rounded-full border-2 border-cyan-200/40 shadow-[0_0_40px_rgba(56,189,248,0.25)]">
              <Image
                src={PROFILE_PHOTO}
                alt={`${profile.name} in server laboratory`}
                width={640}
                height={800}
                priority
                unoptimized
                className="h-full w-full object-cover"
              />
            </div>
          ) : null}

          {/* Interactive Floating Micro-HUD Badge below photo */}
          <span className="identity-core-badge pointer-events-none" aria-hidden>
            <span className="identity-core-badge-tag">OPERATOR CORE</span>
            <span className="identity-core-badge-name">{profile.displayName}</span>
            <span className="identity-core-badge-hint">EXPAND DOSSIER</span>
          </span>
        </button>

        {/* 5 Floating Peripheral Node Buttons */}
        {identityNodes.map((node) => (
          <button
            key={node.id}
            ref={(el) => {
              nodeRefs.current[node.id] = el;
            }}
            type="button"
            className="identity-node absolute left-0 top-0 touch-manipulation group"
            style={{ ["--node-color" as string]: node.color }}
            aria-haspopup="dialog"
            aria-expanded={identityInteraction.open === node.id}
            aria-controls="identity-modal"
            aria-label={`${node.label} node - ${node.kicker}. Click to view details and visualization.`}
            onPointerEnter={() => hoverIdentity(node.id)}
            onPointerLeave={() => hoverIdentity(null)}
            onFocus={() => {
              identityInteraction.focused = node.id;
              hoverIdentity(node.id);
            }}
            onBlur={() => {
              identityInteraction.focused = null;
              hoverIdentity(null);
            }}
            onClick={(event) => activate(node.id, event.currentTarget)}
          >
            <span className="identity-node-dot" aria-hidden />
            <div className="flex flex-col items-start text-left">
              <span className="identity-node-label">{node.label}</span>
              <span className="identity-node-kicker">{node.kicker}</span>
            </div>
          </button>
        ))}

        {/* Live System Telemetry Status Bar */}
        <div className="pointer-events-none absolute bottom-5 left-1/2 -translate-x-1/2 hidden md:flex items-center gap-3 rounded-full border border-white/10 bg-slate-950/70 px-4 py-1.5 backdrop-blur-md">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" aria-hidden />
          <p className="font-mono text-[10px] tracking-[0.2em] text-slate-300 uppercase">
            {identityInteraction.hovered === "core" ? (
              <span className="text-cyan-300">CORE ACTIVE · S GNAN CHARAN {"//"} ALL 5 VECTORS LINKED</span>
            ) : activeNode ? (
              <span>
                LINKED: <strong className="text-cyan-200">{activeNode.label}</strong> · {activeNode.kicker} {"//"} LATENCY 0.12ms
              </span>
            ) : (
              <span>SYSTEM ONLINE · 5 NEURAL VECTORS ACTIVE {"//"} CLICK ANY NODE OR PHOTO</span>
            )}
          </p>
        </div>
      </div>

      {/* Premium Animated Expansion Modal */}
      <IdentityModal onClose={closeIdentity} />
    </>
  );
}
