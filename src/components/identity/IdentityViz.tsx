"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2, Cpu, HardDrive, Play, RefreshCw, ShieldCheck, Terminal, Wifi } from "lucide-react";
import type { IdentityNodeId } from "@/types";

export function IdentityViz({ id, color }: { id: IdentityNodeId; color: string }) {
  return (
    <div className="identity-viz glass-panel relative overflow-hidden rounded-2xl p-4 sm:p-5 border border-white/10 bg-slate-900/60 backdrop-blur-md">
      <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-cyan-200/80">
          Interactive Subsystem Telemetry
        </p>
        <span
          className="inline-block h-2 w-2 rounded-full shadow-[0_0_8px_currentColor]"
          style={{ backgroundColor: color, color }}
          aria-hidden
        />
      </div>

      {id === "aiml" ? <VizAiml color={color} /> : null}
      {id === "debugger" ? <VizDebugger color={color} /> : null}
      {id === "web" ? <VizWeb color={color} /> : null}
      {id === "server" ? <VizServer color={color} /> : null}
      {id === "local-ai" ? <VizLocal color={color} /> : null}
      {id === "core" ? <VizCore color={color} /> : null}
    </div>
  );
}

function VizAiml({ color }: { color: string }) {
  const [pulseLayer, setPulseLayer] = useState<number | null>(null);

  const nodes = [
    // Inputs (0, 1, 2)
    [24, 35],
    [24, 75],
    [24, 115],
    // Latents (3, 4, 5, 6)
    [95, 22],
    [95, 58],
    [95, 94],
    [95, 130],
    // Readouts (7, 8)
    [165, 55],
    [165, 95],
  ];

  const links: Array<[number, number]> = [
    [0, 3],
    [0, 4],
    [1, 4],
    [1, 5],
    [2, 5],
    [2, 6],
    [3, 7],
    [4, 7],
    [4, 8],
    [5, 8],
    [6, 8],
  ];

  return (
    <div className="space-y-3">
      <svg viewBox="0 0 190 150" className="h-44 w-full" aria-hidden>
        {/* Synaptic connection weights */}
        {links.map(([a, b]) => (
          <line
            key={`${a}-${b}`}
            x1={nodes[a][0]}
            y1={nodes[a][1]}
            x2={nodes[b][0]}
            y2={nodes[b][1]}
            stroke={color}
            strokeOpacity={pulseLayer !== null ? "0.6" : "0.28"}
            strokeWidth="1.2"
            className="identity-pulse-stroke"
          />
        ))}

        {/* Neurons */}
        {nodes.map(([x, y], idx) => {
          const isInput = idx < 3;
          const isLatent = idx >= 3 && idx < 7;
          const isOutput = idx >= 7;
          return (
            <circle
              key={`${x}-${y}`}
              cx={x}
              cy={y}
              r={isOutput ? 6 : isLatent ? 4.5 : 4}
              fill={color}
              className="cursor-pointer transition hover:scale-125"
              onClick={() => setPulseLayer(idx)}
            />
          );
        })}

        <text x="12" y="146" fill="#94a3b8" fontSize="8" fontFamily="monospace">
          INPUT TENSORS
        </text>
        <text x="76" y="146" fill="#94a3b8" fontSize="8" fontFamily="monospace">
          LATENT SPACE
        </text>
        <text x="140" y="146" fill="#94a3b8" fontSize="8" fontFamily="monospace">
          READOUT
        </text>
      </svg>

      <div className="rounded-xl border border-white/10 bg-black/40 p-2.5 font-mono text-[10px] text-slate-300">
        <div className="flex justify-between text-cyan-200">
          <span>TENSOR: [1, 4096, 768]</span>
          <span>4-BIT AWQ</span>
        </div>
        <div className="mt-1 flex justify-between text-slate-400">
          <span>HOST: CUDA / VRAM</span>
          <span>SPEED: ~22ms/tok</span>
        </div>
      </div>
    </div>
  );
}

function VizDebugger({ color }: { color: string }) {
  const [stage, setStage] = useState<number>(0);

  const traces = [
    { code: "0x7ffe", label: "MBR boot.stage2", status: "VERIFIED", ok: true },
    { code: "0x7fff", label: "systemd journal", status: "CONTENDED", ok: false },
    { code: "0x8001", label: "cgroup memory limit", status: stage > 0 ? "ISOLATED" : "PENDING", ok: stage > 0 },
    { code: "0x8004", label: "host health check", status: stage > 0 ? "RECOVERED" : "AWAITING", ok: stage > 0 },
  ];

  return (
    <div className="space-y-3 font-mono text-[11px]">
      <div className="space-y-1.5 rounded-xl border border-white/10 bg-black/60 p-3">
        {traces.map((trace, idx) => (
          <div
            key={trace.code}
            className="flex items-center justify-between rounded px-2 py-1 transition"
            style={{
              backgroundColor: trace.ok ? "rgba(126,200,179,0.08)" : "rgba(239,68,68,0.12)",
            }}
          >
            <div className="flex items-center gap-2">
              <span className="text-slate-500">{trace.code}</span>
              <span className="text-slate-200">{trace.label}</span>
            </div>
            <span
              className="text-[9px] uppercase px-1.5 py-0.5 rounded font-bold"
              style={{
                color: trace.ok ? "#7ec8b3" : "#f87171",
              }}
            >
              {trace.status}
            </span>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setStage((prev) => (prev === 0 ? 1 : 0))}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 py-2 font-mono text-xs uppercase tracking-wider text-slate-200 hover:border-cyan-300 transition"
      >
        <RefreshCw size={12} className={stage > 0 ? "text-emerald-400" : ""} />
        <span>{stage === 0 ? "Isolate Contention Variable" : "Reset Diagnostic Trace"}</span>
      </button>
    </div>
  );
}

function VizWeb({ color }: { color: string }) {
  const [activeLayer, setActiveLayer] = useState<number>(0);

  const tiers = [
    {
      title: "OPERATOR SURFACE",
      desc: "WebGL 3D Scene + Accessible 2D HUD + GSAP 60fps Ticker",
      metric: "60 FPS // ZERO JANK",
    },
    {
      title: "APPLICATION BOUNDARY",
      desc: "Next.js 16 App Router + Turbopack + Framer Motion State",
      metric: "ZERO HYDRATION MISMATCH",
    },
    {
      title: "SEMANTIC DOCUMENT",
      desc: "Semantic HTML5, ARIA Dialog Traps, Zero-CLS Layout",
      metric: "LCP < 1.2s // 100% SEO",
    },
  ];

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        {tiers.map((tier, idx) => (
          <div
            key={tier.title}
            onPointerEnter={() => setActiveLayer(idx)}
            className="cursor-pointer rounded-xl border p-2.5 transition"
            style={{
              borderColor: activeLayer === idx ? color : "rgba(255,255,255,0.1)",
              backgroundColor: activeLayer === idx ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.3)",
            }}
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] font-bold tracking-widest text-slate-200">
                0{idx + 1} // {tier.title}
              </span>
              <span className="font-mono text-[9px] text-cyan-300">{tier.metric}</span>
            </div>
            <p className="mt-1 text-xs text-slate-400">{tier.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function VizServer({ color }: { color: string }) {
  const services = [
    { name: "swarm/ingress", replicas: "2/2", status: "HEALTHY" },
    { name: "swarm/jellyfin", replicas: "1/1", status: "STREAMING" },
    { name: "swarm/vaultwarden", replicas: "1/1", status: "HEALTHY" },
    { name: "swarm/ollama-ai", replicas: "1/1", status: "STANDBY" },
  ];

  return (
    <div className="space-y-3">
      {/* 24-LED Rack Status Array */}
      <div className="grid grid-cols-8 gap-1 rounded-xl border border-white/10 bg-black/50 p-2.5">
        {Array.from({ length: 24 }).map((_, i) => (
          <span
            key={i}
            className="h-2 rounded-[2px] transition"
            style={{
              backgroundColor: i === 14 ? "#f87171" : color,
              opacity: i % 4 === 0 ? 0.35 : 0.9,
            }}
          />
        ))}
      </div>

      {/* Hardware Telemetry Gauges */}
      <div className="grid grid-cols-2 gap-2 font-mono text-[10px]">
        <div className="rounded-xl border border-white/10 bg-black/40 p-2">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Cpu size={12} />
            <span>CPU UTILIZATION</span>
          </div>
          <p className="mt-1 font-bold text-slate-100">28.4% (8C / 16T)</p>
          <div className="mt-1.5 h-1 w-full rounded-full bg-white/10 overflow-hidden">
            <div className="h-full bg-cyan-400 w-[28%]" />
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-black/40 p-2">
          <div className="flex items-center gap-1.5 text-slate-400">
            <HardDrive size={12} />
            <span>MEMORY POOL</span>
          </div>
          <p className="mt-1 font-bold text-slate-100">14.8 / 32 GB</p>
          <div className="mt-1.5 h-1 w-full rounded-full bg-white/10 overflow-hidden">
            <div className="h-full bg-emerald-400 w-[46%]" />
          </div>
        </div>
      </div>

      {/* Docker Swarm Replicas */}
      <div className="rounded-xl border border-white/10 bg-black/40 p-2 font-mono text-[10px]">
        <div className="space-y-1">
          {services.map((svc) => (
            <div key={svc.name} className="flex justify-between text-slate-300">
              <span>{svc.name}</span>
              <span className="text-emerald-400 font-bold">{svc.replicas}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function VizLocal({ color }: { color: string }) {
  const [running, setRunning] = useState(false);
  const [output, setOutput] = useState("");
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, []);

  const runTest = () => {
    if (timerRef.current) window.clearInterval(timerRef.current);
    setRunning(true);
    setOutput("");
    const text = "System response: Model weights residing in local VRAM. CUDA compute on NVIDIA GPU. Zero third-party telemetry. Air-gap confirmed.";
    let len = 0;
    timerRef.current = window.setInterval(() => {
      len++;
      if (len <= text.length) {
        setOutput(text.slice(0, len));
      } else {
        if (timerRef.current) window.clearInterval(timerRef.current);
        timerRef.current = null;
        setRunning(false);
      }
    }, 22);
  };

  return (
    <div className="space-y-3 font-mono text-[11px]">
      {/* Zero Leak Badge */}
      <div className="flex items-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-950/30 px-3 py-2 text-emerald-300">
        <ShieldCheck size={16} className="shrink-0" />
        <span className="text-[10px] uppercase tracking-wider font-bold">
          100% On-Premises // Zero Outbound Network Egress
        </span>
      </div>

      {/* Terminal Output */}
      <div className="min-h-[70px] rounded-xl border border-white/10 bg-black/60 p-3 text-xs text-slate-200">
        <p className="text-[10px] text-slate-500 flex items-center gap-1.5">
          <Terminal size={11} />
          <span>ollama run deepseek-r1:local</span>
        </p>
        <p className="mt-2 text-slate-300 leading-relaxed">
          {output || <span className="text-slate-600">Click below to test local token generation...</span>}
        </p>
      </div>

      <button
        type="button"
        disabled={running}
        onClick={runTest}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 py-2 font-mono text-xs uppercase tracking-wider text-slate-200 hover:border-cyan-300 disabled:opacity-50 transition"
      >
        <Play size={12} className={running ? "animate-spin" : ""} />
        <span>{running ? "Streaming on Local Silicon..." : "Execute Local Inference Stream"}</span>
      </button>
    </div>
  );
}

function VizCore({ color }: { color: string }) {
  return (
    <div className="space-y-3 font-mono text-[11px]">
      <div className="rounded-xl border border-cyan-400/20 bg-cyan-950/20 p-3">
        <p className="text-[10px] uppercase tracking-widest text-cyan-200 font-bold">
          PHYSICAL TOPOLOGY & CAMPUS ANCHOR
        </p>
        <div className="mt-2 space-y-1.5 text-slate-300 text-xs">
          <p className="flex justify-between">
            <span className="text-slate-500">CAMPUS:</span>
            <span>Nadimpalli Satyanarayana Raju Institute of Technology, AP</span>
          </p>
          <p className="flex justify-between">
            <span className="text-slate-500">DISCIPLINE:</span>
            <span>B.Tech AI & Data Science / ML</span>
          </p>
          <p className="flex justify-between">
            <span className="text-slate-500">LAB ENVIRONMENT:</span>
            <span>Self-Hosted Linux & Dedicated Compute</span>
          </p>
          <p className="flex justify-between">
            <span className="text-slate-500">ARCHITECTURE:</span>
            <span>Hybrid Local / Isolated Workloads</span>
          </p>
        </div>
      </div>
    </div>
  );
}
