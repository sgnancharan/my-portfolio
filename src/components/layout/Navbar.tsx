"use client";

import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { navItems } from "@/data/navigation";
import { profile } from "@/data/profile";
import { cn } from "@/lib/cn";

export function Navbar() {
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
          ? "border-white/10 bg-[#070b12]/75 backdrop-blur-xl"
          : "border-transparent bg-transparent",
      )}
    >
      <nav
        aria-label="Primary"
        className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8 lg:px-10"
      >
        <a
          href="#hero"
          className="font-mono text-xs tracking-[0.28em] text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/70"
        >
          {profile.shortName}
          <span className="ml-2 hidden text-slate-500 sm:inline">/ PORTFOLIO</span>
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

        <a
          href={profile.github}
          className="hidden font-mono text-[11px] uppercase tracking-[0.22em] text-cyan-100/90 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/70 md:inline"
          rel="noreferrer"
          target="_blank"
        >
          GitHub
        </a>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-white/10 text-slate-100 md:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/70"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X size={18} aria-hidden /> : <Menu size={18} aria-hidden />}
          <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
        </button>
      </nav>

      {open ? (
        <div
          id="mobile-nav"
          className="border-t border-white/10 bg-[#070b12]/95 px-5 py-6 md:hidden"
        >
          <ul className="flex flex-col gap-4">
            {navItems.map((item) => (
              <li key={item.id}>
                <a
                  href={item.href}
                  className="block py-1 font-mono text-sm uppercase tracking-[0.22em] text-slate-100"
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </a>
              </li>
            ))}
            <li>
              <a
                href={profile.github}
                className="block py-1 font-mono text-sm uppercase tracking-[0.22em] text-cyan-100"
                rel="noreferrer"
                target="_blank"
              >
                GitHub
              </a>
            </li>
          </ul>
        </div>
      ) : null}
    </header>
  );
}
