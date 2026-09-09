"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { useTheme } from "@/components/providers/ThemeProvider";

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export function ThemeToggle({ className = "", showLabel = false }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className={`h-9 w-9 rounded-full border border-white/10 bg-slate-900/40 ${className}`}
        aria-hidden
      />
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`theme-toggle group relative inline-flex items-center gap-2 rounded-full border border-white/15 bg-slate-900/60 px-2.5 py-1.5 text-xs font-mono tracking-widest text-slate-200 backdrop-blur-md transition-all duration-300 hover:border-cyan-400/50 hover:bg-cyan-950/40 hover:text-cyan-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70 cursor-pointer shadow-[0_0_12px_rgba(0,0,0,0.2)] ${className}`}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      title={`Current mode: ${isDark ? "Dark (Deep Space)" : "Light (Aerospace Lab)"}`}
    >
      {/* Icon with smooth rotation transition */}
      <div className="relative flex h-4 w-4 items-center justify-center">
        <Sun
          size={15}
          className={`absolute text-amber-400 transition-all duration-500 transform ${
            isDark
              ? "rotate-90 scale-0 opacity-0"
              : "rotate-0 scale-100 opacity-100"
          }`}
          aria-hidden
        />
        <Moon
          size={15}
          className={`absolute text-cyan-300 transition-all duration-500 transform ${
            isDark
              ? "rotate-0 scale-100 opacity-100"
              : "-rotate-90 scale-0 opacity-0"
          }`}
          aria-hidden
        />
      </div>

      {showLabel && (
        <span className="text-[10px] uppercase font-semibold tracking-[0.2em]">
          {isDark ? "DARK" : "LIGHT"}
        </span>
      )}
    </button>
  );
}
