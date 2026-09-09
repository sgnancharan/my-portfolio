"use client";

import { useEffect, useState } from "react";
import { OrangeZipTearOverlay } from "@/components/ui/OrangeZipTearOverlay";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useTheme } from "@/components/providers/ThemeProvider";
import {
  getLaunchIntroSnapshot,
  skipLaunchIntro,
  startLaunchSequence,
  subscribeLaunchIntro,
} from "@/lib/launch-intro-state";

export function IsroLaunchHud() {
  const { theme } = useTheme();
  const isLight = theme === "light";
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

  // Active checking subsystem (for mobile compact ticker)
  const activeCheckingSys = snap.systems.find((s) => s.status === "CHECKING");
  const goCount = snap.systems.filter((s) => s.status === "GO").length;

  return (
    <>
      {/* ========================================================
          1. RADIANT ORANGE SCREEN WALL WITH BOTTOM-UP INVERTED V TEAR
          ======================================================== */}
      <OrangeZipTearOverlay
        orangeWall={snap.orangeWall}
        zipProgress={snap.zipProgress}
      />

      {/* ========================================================
          2. MISSION CONTROL HUD (SCALABLE DESKTOP & MOBILE)
          ======================================================== */}
      {isHudActive && (
        <div
          className="fixed inset-0 z-50 select-none pointer-events-none transition-opacity duration-300 overflow-hidden font-mono"
          style={{ opacity: isHudActive ? 1 : 0 }}
          aria-label="ISRO Sriharikota Launch Mission Control HUD"
        >
          {/* Top Mission Telemetry Header */}
          <header
            className={`absolute top-0 inset-x-0 p-3 sm:p-6 flex items-start justify-between text-[9px] sm:text-xs tracking-[0.18em] sm:tracking-[0.2em] uppercase ${
              isLight ? "text-slate-700" : "text-cyan-200/80"
            }`}
          >
            {/* Left: Launch Complex Location */}
            <div className="flex flex-col gap-0.5 sm:gap-1">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
                <span
                  className={`tracking-[0.2em] sm:tracking-[0.25em] font-extrabold ${
                    isLight ? "text-sky-700" : "text-cyan-300"
                  }`}
                >
                  SDSC SHAR // SRIHARIKOTA
                </span>
              </div>
              <span className={isLight ? "text-amber-700 text-[8px] sm:text-[10px] font-bold" : "text-amber-300 text-[8px] sm:text-[10px]"}>
                <span className="hidden sm:inline">LC-2 · 13.7199° N, 80.2304° E · AZ 104° SE</span>
                <span className="sm:hidden">LC-2 · SHAR COMPLEX</span>
              </span>
            </div>

            {/* Center: Mission Mode (Desktop only) */}
            <div className="hidden md:flex flex-col items-center">
              <span
                className={`px-3 py-1 rounded-full text-[9.5px] ${
                  isLight
                    ? "border border-amber-400 bg-white/95 text-amber-700 font-black shadow-sm"
                    : "border border-cyan-400/30 bg-cyan-950/40 text-cyan-300"
                }`}
              >
                INDIAN SPACE RESEARCH ORGANISATION
              </span>
              <span className={`text-[8.5px] mt-1 tracking-[0.3em] font-bold ${isLight ? "text-sky-700" : "text-cyan-200"}`}>
                LAUNCH VEHICLE // LVM3 HEAVY LIFTER
              </span>
            </div>

            {/* Right: Telemetry Carrier Lock & Time counter */}
            <div className="flex flex-col items-end gap-0.5 sm:gap-1 text-right">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className={isLight ? "text-emerald-700 font-black" : "text-emerald-400 font-medium"}>
                  S-BAND 2.2GHz
                </span>
                <span
                  className={`px-1 py-0.2 sm:px-1.5 sm:py-0.5 rounded text-[7.5px] sm:text-[8px] font-black ${
                    isLight
                      ? "bg-emerald-100 border border-emerald-400 text-emerald-800"
                      : "bg-emerald-950/70 border border-emerald-500/40 text-emerald-300"
                  }`}
                >
                  LOCK
                </span>
              </div>
              <span className={isLight ? "text-amber-700 text-[8.5px] sm:text-[10px] font-black" : "text-amber-300 text-[8.5px] sm:text-[10px]"}>
                {snap.phase === "LIFTOFF"
                  ? `MET +00:${Math.min(99, Math.floor(snap.rocketY * 2.8)).toString().padStart(2, "0")}`
                  : snap.countdown >= 0
                  ? `T -00:0${snap.countdown}`
                  : "STANDBY"}
              </span>
            </div>
          </header>

          {/* ========================================================
              MOBILE-OPTIMIZED TELEMETRY & STATUS STRIP (< 768px)
              Prevents overlap while keeping rocket in full view
              ======================================================== */}
          <div className="md:hidden absolute top-14 inset-x-3 flex flex-col gap-2 z-40 pointer-events-none">
            {/* Subsystem Auto-Check Ticker Bar */}
            <div
              className={`p-2 rounded-xl border backdrop-blur-md flex items-center justify-between transition-all duration-200 ${
                snap.allSystemsGo
                  ? isLight
                    ? "border-emerald-500 bg-emerald-50/95 text-emerald-800 shadow-sm"
                    : "border-emerald-400 bg-emerald-950/70 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                  : isLight
                  ? "border-sky-300 bg-white/95 text-slate-800 shadow-sm"
                  : "border-cyan-500/30 bg-slate-950/75 text-cyan-200"
              }`}
            >
              <div className="flex items-center gap-2 text-[9px] font-bold tracking-wider">
                <span className={`h-2 w-2 rounded-full ${snap.allSystemsGo ? "bg-emerald-400" : "bg-amber-400 animate-ping"}`} />
                <span>
                  {snap.allSystemsGo
                    ? "ALL 7 SUBSYSTEMS VERIFIED // GO"
                    : activeCheckingSys
                    ? `VERIFYING: ${activeCheckingSys.name}`
                    : "AUTONOMOUS DIAGNOSTICS"}
                </span>
              </div>

              {/* 7 Micro Status LED Dots */}
              <div className="flex items-center gap-1">
                {snap.systems.map((sys) => (
                  <span
                    key={sys.id}
                    className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${
                      sys.status === "GO"
                        ? "bg-emerald-400 shadow-[0_0_6px_#34d399]"
                        : sys.status === "CHECKING"
                        ? "bg-amber-400 animate-pulse"
                        : isLight
                        ? "bg-slate-300"
                        : "bg-slate-700"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* ========================================================
              DESKTOP LEFT SUBSYSTEM CHECKLIST (>= 768px)
              ======================================================== */}
          <div className="hidden md:flex absolute left-4 sm:left-8 top-24 sm:top-28 w-60 sm:w-72 flex-col gap-2">
            <div
              className={`pb-1.5 flex items-center justify-between text-[9px] uppercase tracking-[0.25em] border-b ${
                isLight ? "border-sky-300 text-sky-700 font-black" : "border-cyan-400/30 text-cyan-300 font-bold"
              }`}
            >
              <span>SUBSYSTEM STATUS</span>
              <span>AUTO CHECK ({goCount}/7)</span>
            </div>

            {snap.systems.map((sys) => {
              const isGo = sys.status === "GO";
              const isChecking = sys.status === "CHECKING";

              return (
                <div
                  key={sys.id}
                  className={`p-2 rounded border transition-all duration-200 backdrop-blur-md ${
                    isGo
                      ? isLight
                        ? "border-emerald-500 bg-white/95 text-emerald-700 shadow-sm"
                        : "border-emerald-500/50 bg-emerald-950/40 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.15)]"
                      : isChecking
                      ? isLight
                        ? "border-amber-500 bg-amber-50/95 text-amber-700 shadow-sm animate-pulse"
                        : "border-amber-400/60 bg-amber-950/40 text-amber-300 animate-pulse"
                      : isLight
                      ? "border-sky-300 bg-white/90 text-sky-700"
                      : "border-cyan-500/20 bg-slate-950/40 text-cyan-200"
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-bold tracking-[0.18em]">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={
                          isGo
                            ? isLight
                              ? "text-emerald-700 font-extrabold"
                              : "text-emerald-400"
                            : isChecking
                            ? isLight
                              ? "text-amber-600 font-bold"
                              : "text-amber-300"
                            : isLight
                            ? "text-sky-600"
                            : "text-cyan-300"
                        }
                      >
                        {isGo ? "✓" : isChecking ? "▶" : "○"}
                      </span>
                      <span>{sys.name}</span>
                    </div>
                    <span
                      className={`text-[8.5px] tracking-widest font-mono font-black ${
                        isGo
                          ? isLight
                            ? "text-emerald-700"
                            : "text-emerald-300"
                          : isChecking
                          ? isLight
                            ? "text-amber-700"
                            : "text-amber-300"
                          : isLight
                          ? "text-sky-700"
                          : "text-cyan-300"
                      }`}
                    >
                      {isGo ? "GO" : isChecking ? "CHECKING..." : "WAIT"}
                    </span>
                  </div>
                </div>
              );
            })}

            {snap.allSystemsGo && (
              <div
                className={`mt-1 p-2.5 rounded border-2 text-center text-xs tracking-[0.25em] font-black animate-pulse ${
                  isLight
                    ? "border-emerald-500 bg-emerald-100 text-emerald-800 shadow-md"
                    : "border-emerald-400 bg-emerald-950/80 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.4)]"
                }`}
              >
                &gt;&gt;&gt; ALL SYSTEMS GO &lt;&lt;&lt;
              </div>
            )}
          </div>

          {/* ========================================================
              DESKTOP RIGHT FLIGHT DYNAMICS TELEMETRY (>= 768px)
              ======================================================== */}
          <div className="hidden md:flex absolute right-4 sm:right-8 top-24 sm:top-28 w-56 sm:w-64 flex-col gap-2.5">
            <div
              className={`pb-1.5 flex items-center justify-between text-[9px] uppercase tracking-[0.25em] border-b ${
                isLight ? "border-sky-300 text-sky-700 font-black" : "border-cyan-400/30 text-cyan-300 font-bold"
              }`}
            >
              <span>FLIGHT TELEMETRY</span>
              <span>STAGE-1 S200</span>
            </div>

            {/* Altitude Gauge */}
            <div
              className={`p-2.5 rounded border backdrop-blur-md flex flex-col ${
                isLight
                  ? "border-sky-300 bg-white/95 shadow-sm"
                  : "border-cyan-500/30 bg-slate-950/60"
              }`}
            >
              <span className={`text-[8.5px] tracking-[0.2em] uppercase font-bold ${isLight ? "text-amber-600" : "text-amber-300"}`}>
                ALTITUDE
              </span>
              <span className={`text-xl sm:text-2xl font-black tracking-tight ${isLight ? "text-sky-700" : "text-cyan-200"}`}>
                {snap.rocketAltitudeMeters > 0
                  ? `${(snap.rocketAltitudeMeters / 1000).toFixed(2)} KM`
                  : "0.00 M (PAD)"}
              </span>
            </div>

            {/* Velocity Gauge */}
            <div
              className={`p-2.5 rounded border backdrop-blur-md flex flex-col ${
                isLight
                  ? "border-sky-300 bg-white/95 shadow-sm"
                  : "border-cyan-500/30 bg-slate-950/60"
              }`}
            >
              <span className={`text-[8.5px] tracking-[0.2em] uppercase font-bold ${isLight ? "text-amber-600" : "text-amber-300"}`}>
                VELOCITY
              </span>
              <span className={`text-xl sm:text-2xl font-black tracking-tight ${isLight ? "text-sky-700" : "text-cyan-300"}`}>
                {snap.rocketVelocity > 0
                  ? `${Math.floor(snap.rocketVelocity)} M/S`
                  : "0 M/S"}
              </span>
            </div>

            {/* Thrust Gauge */}
            <div
              className={`p-2.5 rounded border backdrop-blur-md flex flex-col gap-1.5 ${
                isLight
                  ? "border-sky-300 bg-white/95 shadow-sm"
                  : "border-cyan-500/30 bg-slate-950/60"
              }`}
            >
              <div className={`flex justify-between text-[8.5px] tracking-wider font-bold ${isLight ? "text-amber-600" : "text-amber-300"}`}>
                <span>S200 + L110 THRUST</span>
                <span>{Math.round(snap.engineThrust * 100)}%</span>
              </div>
              <div className={`h-2 w-full rounded-full overflow-hidden ${isLight ? "bg-slate-200" : "bg-slate-800"}`}>
                <div
                  className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-emerald-400 transition-all duration-150"
                  style={{ width: `${snap.engineThrust * 100}%` }}
                />
              </div>
            </div>

            {/* National Flag Verification */}
            <div
              className={`p-2 rounded border flex items-center justify-between text-[8px] ${
                isLight
                  ? "border-amber-400 bg-white/95 text-amber-800 shadow-sm"
                  : "border-amber-500/30 bg-slate-950/50 text-amber-200"
              }`}
            >
              <span className={`font-bold ${isLight ? "text-amber-700" : "text-amber-300"}`}>LIVERY:</span>
              <span className="font-black tracking-widest text-amber-500">
                🇮🇳 TRICOLOR MOUNTED
              </span>
            </div>
          </div>

          {/* ========================================================
              MOBILE BOTTOM FLIGHT TELEMETRY HUD BAR (< 768px)
              Neat 3-column horizontal HUD above bottom controls
              ======================================================== */}
          <div className="md:hidden absolute bottom-16 inset-x-3 z-40 pointer-events-none">
            <div
              className={`grid grid-cols-3 divide-x rounded-xl border p-2 backdrop-blur-md text-center shadow-lg ${
                isLight
                  ? "border-sky-300 bg-white/95 divide-slate-200 text-slate-800"
                  : "border-cyan-500/30 bg-slate-950/85 divide-slate-800 text-cyan-200"
              }`}
            >
              <div className="px-1 flex flex-col">
                <span className={`text-[7.5px] uppercase tracking-wider font-bold ${isLight ? "text-amber-700" : "text-amber-300"}`}>
                  ALTITUDE
                </span>
                <span className={`text-xs font-black tracking-tight ${isLight ? "text-sky-700" : "text-cyan-200"}`}>
                  {snap.rocketAltitudeMeters > 0
                    ? `${(snap.rocketAltitudeMeters / 1000).toFixed(1)} KM`
                    : "0.0 M"}
                </span>
              </div>
              <div className="px-1 flex flex-col">
                <span className={`text-[7.5px] uppercase tracking-wider font-bold ${isLight ? "text-amber-700" : "text-amber-300"}`}>
                  VELOCITY
                </span>
                <span className={`text-xs font-black tracking-tight ${isLight ? "text-sky-700" : "text-cyan-300"}`}>
                  {snap.rocketVelocity > 0 ? `${Math.floor(snap.rocketVelocity)} M/S` : "0 M/S"}
                </span>
              </div>
              <div className="px-1 flex flex-col">
                <span className={`text-[7.5px] uppercase tracking-wider font-bold ${isLight ? "text-amber-700" : "text-amber-300"}`}>
                  THRUST
                </span>
                <div className="flex items-center justify-center gap-1 mt-0.5">
                  <span className="text-xs font-black text-emerald-500">
                    {Math.round(snap.engineThrust * 100)}%
                  </span>
                  <div className={`h-1.5 w-7 rounded-full overflow-hidden ${isLight ? "bg-slate-200" : "bg-slate-800"}`}>
                    <div
                      className="h-full bg-emerald-400 transition-all duration-150"
                      style={{ width: `${snap.engineThrust * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================
              3. UNMISSABLE CENTRAL COUNTDOWN DISPLAY
              ======================================================== */}
          {snap.countdown >= 0 && snap.phase !== "TRANSITION" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-50 px-4">
              <div
                className={`flex flex-col items-center justify-center px-6 py-5 sm:px-10 sm:py-7 rounded-2xl sm:rounded-3xl border-2 transform scale-100 sm:scale-105 transition-transform duration-200 ${
                  isLight
                    ? "border-amber-500/80 bg-white/95 backdrop-blur-2xl shadow-[0_0_60px_rgba(245,158,11,0.25)]"
                    : "border-amber-400/60 bg-slate-950/90 backdrop-blur-2xl shadow-[0_0_90px_rgba(251,191,36,0.5)]"
                }`}
              >
                <span
                  className={`font-mono text-[10px] sm:text-sm uppercase tracking-[0.3em] sm:tracking-[0.42em] font-bold mb-1 sm:mb-2 ${
                    isLight ? "text-amber-800" : "text-cyan-300"
                  }`}
                >
                  TERMINAL COUNTDOWN
                </span>
                <span
                  className={`font-mono text-7xl sm:text-9xl md:text-[11rem] font-black tracking-tight leading-none select-none animate-pulse ${
                    isLight
                      ? "text-amber-600 drop-shadow-[0_4px_30px_rgba(217,119,6,0.35)]"
                      : "text-amber-400 drop-shadow-[0_0_60px_rgba(251,191,36,0.9)]"
                  }`}
                >
                  {snap.countdownLabel || `T - ${snap.countdown}`}
                </span>
                <span
                  className={`mt-2 sm:mt-4 font-mono text-[10px] sm:text-sm tracking-[0.25em] sm:tracking-[0.35em] uppercase font-bold text-center ${
                    isLight ? "text-slate-700" : "text-cyan-200"
                  }`}
                >
                  {snap.statusSubline}
                </span>
              </div>
            </div>
          )}

          {/* Center Initial Header before countdown: Main Systems Diagnostics */}
          {(snap.phase === "INIT" || snap.phase === "SYSTEMS_CHECK") && snap.countdown < 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-4 z-50">
              <div
                className={`relative flex flex-col items-center justify-center p-5 sm:p-12 text-center rounded-2xl sm:rounded-3xl border-2 backdrop-blur-2xl transition-all duration-300 max-w-[92vw] sm:max-w-2xl ${
                  isLight
                    ? "border-sky-400/80 bg-white/95 shadow-[0_0_60px_rgba(14,165,233,0.35)]"
                    : "border-cyan-400/60 bg-slate-950/90 shadow-[0_0_70px_rgba(56,189,248,0.4)]"
                }`}
              >
                <span className={`hud-bracket hud-bracket-tl !w-5 !h-5 sm:!w-7 sm:!h-7 border-2 ${isLight ? "!border-sky-500" : "!border-cyan-400"}`} />
                <span className={`hud-bracket hud-bracket-tr !w-5 !h-5 sm:!w-7 sm:!h-7 border-2 ${isLight ? "!border-sky-500" : "!border-cyan-400"}`} />
                <span className={`hud-bracket hud-bracket-bl !w-5 !h-5 sm:!w-7 sm:!h-7 border-2 ${isLight ? "!border-sky-500" : "!border-cyan-400"}`} />
                <span className={`hud-bracket hud-bracket-br !w-5 !h-5 sm:!w-7 sm:!h-7 border-2 ${isLight ? "!border-sky-500" : "!border-cyan-400"}`} />

                <span className={`text-[9.5px] sm:text-sm uppercase tracking-[0.3em] sm:tracking-[0.45em] font-black ${isLight ? "text-amber-600" : "text-amber-400"}`}>
                  SRIHARIKOTA COMPLEX 2
                </span>
                <h1
                  className={`mt-2 sm:mt-3 text-2xl sm:text-5xl md:text-7xl font-black tracking-tight drop-shadow-md select-none ${
                    isLight
                      ? "text-transparent bg-clip-text bg-gradient-to-r from-sky-600 via-cyan-600 to-amber-600"
                      : "text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-200 to-amber-300 drop-shadow-[0_0_40px_rgba(56,189,248,0.8)]"
                  }`}
                >
                  {snap.statusHeadline}
                </h1>
                <div className="mt-2.5 sm:mt-4 flex items-center justify-center gap-2">
                  <span className={`h-2 w-2 rounded-full animate-ping shrink-0 ${isLight ? "bg-emerald-500" : "bg-emerald-400"}`} />
                  <span className={`text-[10px] sm:text-sm uppercase tracking-[0.2em] sm:tracking-[0.32em] font-bold ${isLight ? "text-emerald-700" : "text-emerald-300"}`}>
                    // {snap.statusSubline}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Liftoff / Stage-1 Separation Announcement */}
          {snap.phase === "LIFTOFF" && snap.countdown < 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-4 text-center">
              <span
                className={`text-4xl sm:text-7xl font-extrabold tracking-[-0.03em] ${
                  snap.statusHeadline === "STAGE-1 SEPARATION"
                    ? isLight
                      ? "text-amber-600 drop-shadow-[0_4px_30px_rgba(217,119,6,0.35)]"
                      : "text-amber-400 drop-shadow-[0_0_50px_rgba(251,191,36,0.8)]"
                    : isLight
                    ? "text-emerald-700 drop-shadow-[0_4px_30px_rgba(4,120,87,0.3)]"
                    : "text-emerald-300 drop-shadow-[0_0_50px_rgba(52,211,153,0.7)]"
                }`}
              >
                {snap.statusHeadline}
              </span>
              <span
                className={`mt-2 sm:mt-3 text-[10px] sm:text-sm tracking-[0.25em] sm:tracking-[0.35em] uppercase font-bold ${
                  isLight ? "text-slate-800" : "text-cyan-200 font-medium"
                }`}
              >
                {snap.statusSubline}
              </span>
            </div>
          )}

          {/* Bottom Footer, Theme Switcher & Skip Control */}
          <footer
            className={`absolute bottom-0 inset-x-0 p-3 sm:p-6 flex items-center justify-between text-[9px] sm:text-[10px] tracking-[0.16em] sm:tracking-[0.2em] uppercase ${
              isLight ? "text-slate-600" : "text-slate-400"
            }`}
          >
            <div className={`hidden sm:flex items-center gap-4 text-[9px] ${isLight ? "text-slate-600 font-semibold" : "text-slate-500"}`}>
              <span>GRID: SHAR-LC02</span>
              <span>FREQ: 2.24 GHz</span>
              <span>TOW-CLEAR: OK</span>
            </div>

            <div className="hidden sm:flex items-center gap-2 mx-auto sm:mx-0">
              <span className={`h-1 w-8 rounded-full ${isLight ? "bg-sky-400/60" : "bg-cyan-500/40"}`} />
              <span className={`text-[9px] tracking-[0.25em] font-bold ${isLight ? "text-sky-800" : "text-cyan-300"}`}>
                ISRO-INSPIRED LAUNCH PROTOCOL
              </span>
              <span className={`h-1 w-8 rounded-full ${isLight ? "bg-sky-400/60" : "bg-cyan-500/40"}`} />
            </div>

            {/* Right Action Group: Theme Toggle + Skip Sequence */}
            <div className="flex items-center gap-2 pointer-events-auto ml-auto sm:ml-0">
              <ThemeToggle showLabel className="shadow-md" />
              <button
                type="button"
                onClick={() => void skipLaunchIntro()}
                className={`group px-3 py-1.5 sm:px-3.5 sm:py-1.5 rounded-full border backdrop-blur-md text-[8.5px] sm:text-[10px] transition-all duration-300 cursor-pointer focus:outline-none ${
                  isLight
                    ? "border-slate-300/90 bg-white/90 text-slate-800 hover:text-slate-950 hover:border-slate-400 hover:bg-white shadow-sm focus:ring-1 focus:ring-slate-400"
                    : "border-cyan-400/30 bg-slate-950/70 text-cyan-200/90 hover:text-cyan-100 hover:border-cyan-300/80 hover:bg-cyan-950/50 shadow-[0_0_15px_rgba(56,189,248,0.15)] focus:ring-1 focus:ring-cyan-300"
                }`}
                aria-label="Skip launch intro directly to hero"
              >
                <span className="tracking-[0.18em] sm:tracking-[0.22em]">SKIP</span>
                <span
                  className={`ml-1 px-1 rounded text-[7.5px] sm:text-[8px] font-bold ${
                    isLight
                      ? "bg-slate-100 border border-slate-300 text-slate-700"
                      : "bg-cyan-900/60 border border-cyan-400/30 text-cyan-300"
                  }`}
                >
                  ESC
                </span>
              </button>
            </div>
          </footer>
        </div>
      )}
    </>
  );
}
