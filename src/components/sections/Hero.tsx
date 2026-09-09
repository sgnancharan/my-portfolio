"use client";

import { motion } from "framer-motion";
import { ArrowDownRight } from "lucide-react";
import { GithubIcon } from "@/components/ui/SocialIcons";
import { profile } from "@/data/profile";
import { HeroProfile } from "@/components/identity/HeroProfile";
import { JiggleTitle } from "@/components/ui/JiggleTitle";

export function Hero() {
  return (
    <section
      id="hero"
      aria-labelledby="hero-title"
      className="relative z-10 flex min-h-[100svh] flex-col justify-center items-center px-4 pb-16 pt-24 sm:px-8 lg:px-10 text-center overflow-hidden pointer-events-none"
    >
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center pointer-events-auto">
        {/* 1. FACE: The Central Visual Focus with Surrounding Floating Nodes */}
        <HeroProfile />

        {/* 2. NAME: S GNAN CHARAN */}
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
          className="mt-6 sm:mt-8 flex flex-col items-center"
        >
          <p className="font-mono text-[11px] uppercase tracking-[0.36em] text-cyan-200/80">
            MISSION INITIALIZED // ORIGIN 00
          </p>
          <JiggleTitle
            id="hero-title"
            text={profile.displayName}
            className="mt-2 font-display text-4xl sm:text-6xl md:text-8xl lg:text-[6.25rem] leading-[0.94] font-semibold tracking-[-0.03em] text-slate-50 select-none"
          />
          <p className="mt-3 sm:mt-4 max-w-xl font-mono text-xs sm:text-sm uppercase tracking-[0.24em] text-cyan-300">
            {profile.tagline}
          </p>

          {/* Dynamic Cosmic Frequency Telemetry Bars */}
          <div className="mt-2.5 flex items-center justify-center gap-1.5 opacity-85" aria-hidden>
            <span className="h-2 w-0.5 rounded-full bg-cyan-400/80 animate-pulse" style={{ animationDuration: "0.75s" }} />
            <span className="h-3.5 w-0.5 rounded-full bg-sky-400/80 animate-pulse" style={{ animationDuration: "1.15s" }} />
            <span className="h-5 w-0.5 rounded-full bg-indigo-400/80 animate-pulse" style={{ animationDuration: "0.62s" }} />
            <span className="h-3 w-0.5 rounded-full bg-cyan-300/80 animate-pulse" style={{ animationDuration: "0.95s" }} />
            <span className="h-4.5 w-0.5 rounded-full bg-violet-400/80 animate-pulse" style={{ animationDuration: "0.82s" }} />
            <span className="h-2.5 w-0.5 rounded-full bg-sky-300/80 animate-pulse" style={{ animationDuration: "1.05s" }} />
            <span className="h-1.5 w-0.5 rounded-full bg-cyan-400/80 animate-pulse" style={{ animationDuration: "0.88s" }} />
          </div>

          <p className="mt-3 max-w-lg text-sm leading-6 text-slate-400 sm:text-base">
            {profile.study} at {profile.campus}. Systems, containers, and self-hosted infrastructure — with space as the longer study horizon.
          </p>
        </motion.div>

        {/* 3. CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.32, duration: 0.8 }}
          className="mt-8 flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto px-4 sm:px-0"
        >
          <a
            href="#about"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full border border-cyan-100/30 bg-cyan-100/10 px-6 py-3 font-mono text-xs uppercase tracking-[0.22em] text-cyan-50 transition hover:bg-cyan-100/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/70"
          >
            Explore System
            <ArrowDownRight size={16} aria-hidden />
          </a>
          <a
            href={profile.github}
            target="_blank"
            rel="noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full border border-white/15 px-6 py-3 font-mono text-xs uppercase tracking-[0.22em] text-slate-100 transition hover:border-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/70"
          >
            <GithubIcon width={16} height={16} />
            GitHub
          </a>
        </motion.div>

        {/* 4. Interactive Status Hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.52, duration: 0.8 }}
          className="mt-6 flex flex-wrap items-center justify-center gap-3 font-mono text-[10px] uppercase tracking-[0.2em] text-cyan-200/75 px-2"
        >
          <div className="flex items-center gap-2 rounded-full border border-cyan-400/25 bg-cyan-950/40 px-3.5 py-1.5 backdrop-blur-md text-center">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping shrink-0" aria-hidden />
            <span className="hidden sm:inline">Glide Name: Squeeze & Stardust · Click: Supernova · 2x Click: Quantum Scramble</span>
            <span className="sm:hidden">Tap Name for Stardust · Click: Supernova · 2x: Scramble</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
