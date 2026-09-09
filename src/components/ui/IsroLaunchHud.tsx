"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { OrangeZipTearOverlay } from "@/components/ui/OrangeZipTearOverlay";
import {
  getLaunchIntroSnapshot,
  skipLaunchIntro,
  startLaunchSequence,
  subscribeLaunchIntro,
} from "@/lib/launch-intro-state";

export function IsroLaunchHud() {
  const [mounted, setMounted] = useState(false);
  const [snap, setSnap] = useState(() => getLaunchIntroSnapshot());

  useEffect(() => {
    setMounted(true);
    const unsub = subscribeLaunchIntro(() => {
      setSnap(getLaunchIntroSnapshot());
    });

    // Automatic launch sequence triggered as soon as the site loads
    void startLaunchSequence();

    // Escape or Space key listener for skipping sequence
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === " ") {
        void skipLaunchIntro();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      unsub();
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  if (!mounted || snap.isComplete) {
    return null;
  }

  // "everyhud should dissapear from on the screen and load directly the hero section"
  const isHudActive = snap.hudVisible && snap.orangeWall < 0.65;

  return (
    <>
      {/* ========================================================
          1. RADIANT ORANGE SCREEN WALL WITH BOTTOM-MIDDLE UNZIPPING TEAR
          "after the orange fill out the entire screen it will tear from bottom middle and seperate like opening zip without zipper to reveal the hero section of the website"
          ======================================================== */}
      <OrangeZipTearOverlay
        orangeWall={snap.orangeWall}
        zipProgress={snap.zipProgress}
      />

      {/* ========================================================
          2. MISSION CONTROL HUD
          "everyhud should dissapear from on the screen and load directly the hero section"
          ======================================================== */}
      {isHudActive && (
        <div
          className="fixed inset-0 z-50 select-none pointer-events-none transition-opacity duration-300 overflow-hidden font-mono"
          style={{ opacity: isHudActive ? 1 : 0 }}
          aria-label="ISRO Sriharikota Launch Mission Control HUD"
        >
          {/* Top Mission Telemetry Header */}
          <header className="absolute top-0 inset-x-0 p-4 sm:p-6 flex items-start justify-between text-[10px] sm:text-xs text-cyan-200/80 tracking-[0.2em] uppercase">
            {/* Left: Launch Complex Location */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="font-semibold text-slate-100 tracking-[0.25em]">
                  SDSC SHAR // SRIHARIKOTA
                </span>
              </div>
              <span className="text-slate-400 text-[9px] sm:text-[10px]">
                LC-2 · 13.7199° N, 80.2304° E · AZ 104° SE
              </span>
            </div>

            {/* Center: Mission Mode */}
            <div className="hidden md:flex flex-col items-center">
              <span className="px-3 py-1 rounded-full border border-cyan-400/30 bg-cyan-950/40 text-[9.5px] text-cyan-300">
                INDIAN SPACE RESEARCH ORGANISATION
              </span>
              <span className="text-[8.5px] text-slate-400 mt-1 tracking-[0.3em]">
                LAUNCH VEHICLE // LVM3 HEAVY LIFTER
              </span>
            </div>

            {/* Right: Telemetry Carrier Lock */}
            <div className="flex flex-col items-end gap-1 text-right">
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 font-medium">S-BAND 2240MHz</span>
                <span className="px-1.5 py-0.5 rounded text-[8px] bg-emerald-950/70 border border-emerald-500/40 text-emerald-300">
                  LOCK
                </span>
              </div>
              <span className="text-slate-400 text-[9px] sm:text-[10px]">
                {snap.phase === "LIFTOFF"
                  ? `MET +00:00:${Math.min(99, Math.floor(snap.rocketY * 2.8)).toString().padStart(2, "0")}`
                  : snap.countdown >= 0
                  ? `T -00:00:0${snap.countdown}`
                  : "T-HOLD // STANDBY"}
              </span>
            </div>
          </header>

          {/* Left Subsystem Diagnostic Checks */}
          <div className="absolute left-4 sm:left-8 top-24 sm:top-28 w-60 sm:w-72 flex flex-col gap-2">
            <div className="border-b border-cyan-400/20 pb-1.5 flex items-center justify-between text-[9px] uppercase tracking-[0.25em] text-cyan-300/70">
              <span>SUBSYSTEM STATUS</span>
              <span>AUTO CHECK</span>
            </div>

            {snap.systems.map((sys) => {
              const isGo = sys.status === "GO";
              const isChecking = sys.status === "CHECKING";

              return (
                <div
                  key={sys.id}
                  className={`p-2 rounded border transition-all duration-200 backdrop-blur-sm ${
                    isGo
                      ? "border-emerald-500/40 bg-emerald-950/30 text-emerald-200"
                      : isChecking
                      ? "border-amber-400/50 bg-amber-950/30 text-amber-100 animate-pulse"
                      : "border-white/5 bg-slate-950/20 text-slate-500"
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-semibold tracking-[0.18em]">
                    <div className="flex items-center gap-1.5">
                      <span className={isGo ? "text-emerald-400" : "text-slate-600"}>
                        {isGo ? "✓" : "○"}
                      </span>
                      <span>{sys.name}</span>
                    </div>
                    <span className="text-[8.5px] tracking-widest font-mono">
                      {isGo ? "GO" : isChecking ? "CHECKING..." : "WAIT"}
                    </span>
                  </div>
                </div>
              );
            })}

            {snap.allSystemsGo && (
              <div className="mt-1 p-2 rounded border border-emerald-400/60 bg-emerald-950/60 text-emerald-300 text-center text-xs tracking-[0.25em] font-bold animate-pulse">
                &gt;&gt;&gt; ALL SYSTEMS GO &lt;&lt;&lt;
              </div>
            )}
          </div>

          {/* Right Flight Dynamics Telemetry */}
          <div className="absolute right-4 sm:right-8 top-24 sm:top-28 w-56 sm:w-64 flex flex-col gap-2.5">
            <div className="border-b border-cyan-400/20 pb-1.5 flex items-center justify-between text-[9px] uppercase tracking-[0.25em] text-cyan-300/70">
              <span>FLIGHT TELEMETRY</span>
              <span>STAGE-1 S200</span>
            </div>

            {/* Altitude Gauge */}
            <div className="p-2.5 rounded border border-white/10 bg-slate-950/40 backdrop-blur-sm flex flex-col">
              <span className="text-[8.5px] text-slate-400 tracking-[0.2em] uppercase">ALTITUDE</span>
              <span className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">
                {snap.rocketAltitudeMeters > 0
                  ? `${(snap.rocketAltitudeMeters / 1000).toFixed(2)} KM`
                  : "0.00 M (PAD)"}
              </span>
            </div>

            {/* Velocity Gauge */}
            <div className="p-2.5 rounded border border-white/10 bg-slate-950/40 backdrop-blur-sm flex flex-col">
              <span className="text-[8.5px] text-slate-400 tracking-[0.2em] uppercase">VELOCITY</span>
              <span className="text-xl sm:text-2xl font-bold text-cyan-300 tracking-tight">
                {snap.rocketVelocity > 0
                  ? `${Math.floor(snap.rocketVelocity)} M/S`
                  : "0 M/S"}
              </span>
            </div>

            {/* Thrust Gauge */}
            <div className="p-2.5 rounded border border-white/10 bg-slate-950/40 backdrop-blur-sm flex flex-col gap-1.5">
              <div className="flex justify-between text-[8.5px] text-slate-400 tracking-wider">
                <span>S200 + L110 THRUST</span>
                <span>{Math.round(snap.engineThrust * 100)}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-emerald-400 transition-all duration-150"
                  style={{ width: `${snap.engineThrust * 100}%` }}
                />
              </div>
            </div>

            {/* National Flag Verification */}
            <div className="p-2 rounded border border-amber-500/20 bg-slate-950/30 flex items-center justify-between text-[8px] text-slate-300">
              <span>LIVERY:</span>
              <span className="text-amber-300 font-semibold tracking-widest">🇮🇳 TRICOLOR MOUNTED</span>
            </div>
          </div>

          {/* ========================================================
              3. UNMISSABLE CENTRAL COUNTDOWN DISPLAY
              "count down isnt showing up" -> Large, bold, glowing, centered
              ======================================================== */}
          {snap.countdown >= 0 && snap.phase !== "TRANSITION" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-50">
              <div className="flex flex-col items-center justify-center px-10 py-7 rounded-3xl border-2 border-amber-400/60 bg-slate-950/90 backdrop-blur-2xl shadow-[0_0_90px_rgba(251,191,36,0.5)] transform scale-105 transition-transform duration-200">
                <span className="font-mono text-xs sm:text-sm uppercase tracking-[0.42em] text-cyan-300 font-bold mb-2">
                  TERMINAL COUNTDOWN
                </span>
                <span className="font-mono text-8xl sm:text-9xl md:text-[11rem] font-black tracking-tight text-amber-400 drop-shadow-[0_0_60px_rgba(251,191,36,0.9)] leading-none select-none animate-pulse">
                  {snap.countdownLabel || `T - ${snap.countdown}`}
                </span>
                <span className="mt-4 font-mono text-xs sm:text-sm text-cyan-200 tracking-[0.35em] uppercase font-semibold">
                  {snap.statusSubline}
                </span>
              </div>
            </div>
          )}

          {/* Center Initial Header before countdown */}
          {(snap.phase === "INIT" || snap.phase === "SYSTEMS_CHECK") && snap.countdown < 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-4">
              <div className="relative flex flex-col items-center justify-center p-8 sm:p-12 text-center">
                <span className="hud-bracket hud-bracket-tl !w-6 !h-6 !border-cyan-400/60" />
                <span className="hud-bracket hud-bracket-tr !w-6 !h-6 !border-cyan-400/60" />
                <span className="hud-bracket hud-bracket-bl !w-6 !h-6 !border-cyan-400/60" />
                <span className="hud-bracket hud-bracket-br !w-6 !h-6 !border-cyan-400/60" />

                <span className="text-xs uppercase tracking-[0.45em] text-cyan-300">
                  SRIHARIKOTA LAUNCH COMPLEX 2
                </span>
                <h1 className="mt-2 text-4xl sm:text-6xl font-bold tracking-tight text-slate-100">
                  {snap.statusHeadline}
                </h1>
                <div className="mt-3 flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping" />
                  <span className="text-xs sm:text-sm uppercase tracking-[0.3em] text-cyan-200/90 font-medium">
                    // {snap.statusSubline}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Liftoff Announcement */}
          {snap.phase === "LIFTOFF" && snap.countdown < 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-4">
              <span className="text-5xl sm:text-7xl font-extrabold tracking-[-0.03em] text-emerald-300 drop-shadow-[0_0_50px_rgba(52,211,153,0.7)]">
                LIFTOFF
              </span>
              <span className="mt-3 text-xs sm:text-sm text-cyan-200 tracking-[0.35em] uppercase font-medium">
                SRIHARIKOTA TOWER CLEARED // ASCENT VECTOR NOMINAL
              </span>
            </div>
          )}

          {/* Bottom Footer & Skip Control */}
          <footer className="absolute bottom-0 inset-x-0 p-4 sm:p-6 flex items-end justify-between text-[10px] text-slate-400 tracking-[0.2em] uppercase">
            <div className="hidden sm:flex items-center gap-4 text-slate-500 text-[9px]">
              <span>GRID: SHAR-LC02</span>
              <span>FREQ: 2.24 GHz</span>
              <span>TOW-CLEAR: OK</span>
            </div>

            <div className="flex items-center gap-2 mx-auto sm:mx-0">
              <span className="h-1 w-8 bg-cyan-500/40 rounded-full" />
              <span className="text-[9px] text-cyan-300 tracking-[0.25em]">
                ISRO-INSPIRED LAUNCH PROTOCOL
              </span>
              <span className="h-1 w-8 bg-cyan-500/40 rounded-full" />
            </div>

            <button
              type="button"
              onClick={() => void skipLaunchIntro()}
              className="pointer-events-auto group px-3.5 py-1.5 rounded-full border border-cyan-400/30 bg-slate-950/70 backdrop-blur-md text-[9px] sm:text-[10px] text-cyan-200/90 hover:text-cyan-100 hover:border-cyan-300/80 hover:bg-cyan-950/50 transition-all duration-300 cursor-pointer shadow-[0_0_15px_rgba(56,189,248,0.15)] focus:outline-none focus:ring-1 focus:ring-cyan-300"
              aria-label="Skip launch intro directly to hero"
            >
              <span className="tracking-[0.22em]">SKIP SEQUENCE</span>
              <span className="ml-1.5 px-1 rounded bg-cyan-900/60 border border-cyan-400/30 text-[8px] text-cyan-300">
                ESC
              </span>
            </button>
          </footer>
        </div>
      )}
    </>
  );
}
