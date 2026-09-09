"use client";

import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { navItems } from "@/data/navigation";
import { profile } from "@/data/profile";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useTheme } from "@/components/providers/ThemeProvider";
import { cn } from "@/lib/cn";

export function Navbar() {
  const { theme } = useTheme();
  const isLight = theme === "light";
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 border-b transition-[background,border-color,backdrop-filter] duration-500",
        scrolled || open
          ? isLight
            ? "border-slate-200/80 bg-white/90 shadow-sm backdrop-blur-xl"
            : "border-white/10 bg-[#070b12]/80 backdrop-blur-xl"
          : "border-transparent bg-transparent",
      )}
    >
      <nav
        aria-label="Primary"
        className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8 lg:px-10"
      >
        <a
          href="#hero"
          className={cn(
            "font-mono text-xs tracking-[0.28em] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/70",
            isLight ? "text-slate-900 font-bold" : "text-slate-100"
          )}
        >
          {profile.shortName}
          <span className={cn("ml-2 hidden sm:inline", isLight ? "text-slate-500" : "text-slate-500")}>/ PORTFOLIO</span>
        </a>

        <ul className="hidden items-center gap-7 md:flex">
          {navItems.map((item) => (
            <li key={item.id}>
              <a
                href={item.href}
                className="font-mono text-[11px] uppercase tracking-[0.22em] text-slate-300/80 transition-colors hover:text-cyan-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/70"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-5 md:flex">
          <a
            href={profile.github}
            className="font-mono text-[11px] uppercase tracking-[0.22em] text-cyan-100/90 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/70"
            rel="noreferrer"
            target="_blank"
          >
            GitHub
          </a>
          <ThemeToggle />
        </div>

        <div className="flex items-center gap-2.5 md:hidden">
          <ThemeToggle />
          <button
            type="button"
            className={cn(
              "inline-flex h-10 w-10 items-center justify-center rounded-md border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/70 cursor-pointer transition-colors",
              isLight
                ? "border-slate-300 bg-white text-slate-800 shadow-sm hover:bg-slate-50"
                : "border-white/10 text-slate-100 hover:bg-white/5"
            )}
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X size={18} aria-hidden /> : <Menu size={18} aria-hidden />}
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
          </button>
        </div>
      </nav>

      {open ? (
        <div
          id="mobile-nav"
          className={cn(
            "border-t px-5 py-6 md:hidden backdrop-blur-xl transition-all duration-300",
            isLight
              ? "border-slate-200 bg-white/98 text-slate-900 shadow-xl"
              : "border-white/10 bg-[#070b12]/95 text-slate-100"
          )}
        >
          <ul className="flex flex-col gap-4">
            {navItems.map((item) => (
              <li key={item.id}>
                <a
                  href={item.href}
                  className={cn(
                    "block py-1 font-mono text-sm uppercase tracking-[0.22em] transition-colors",
                    isLight ? "text-slate-800 hover:text-sky-600 font-semibold" : "text-slate-100 hover:text-cyan-200"
                  )}
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </a>
              </li>
            ))}
            <li>
              <a
                href={profile.github}
                className={cn(
                  "block py-1 font-mono text-sm uppercase tracking-[0.22em] transition-colors",
                  isLight ? "text-sky-700 hover:text-sky-900 font-bold" : "text-cyan-100 hover:text-cyan-300"
                )}
                rel="noreferrer"
                target="_blank"
              >
                GitHub
              </a>
            </li>
            <li className={cn("pt-3 border-t flex items-center justify-between", isLight ? "border-slate-200" : "border-white/10")}>
              <span className={cn("font-mono text-xs uppercase tracking-[0.2em]", isLight ? "text-slate-600 font-bold" : "text-slate-400")}>
                DISPLAY THEME
              </span>
              <ThemeToggle showLabel />
            </li>
          </ul>
        </div>
      ) : null}
    </header>
  );
}
