"use client";

import { useEffect, type ReactNode } from "react";
import Lenis from "lenis";
import { scrollState, viewportState } from "@/lib/scroll-state";

export function SmoothScroll({ children }: { children: ReactNode }) {
  useEffect(() => {
    let cancelled = false;
    let dispose: () => void = () => { };

    void import("@/lib/gsap-client").then(({ getGsap }) => {
      if (cancelled) return;
      const { gsap, ScrollTrigger } = getGsap();
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      viewportState.reducedMotion = reduced;
      viewportState.width = window.innerWidth;
      viewportState.height = window.innerHeight;
      viewportState.isMobile = window.innerWidth < 768;

      const syncFromWindow = () => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        scrollState.scroll = window.scrollY;
        scrollState.progress = max > 0 ? window.scrollY / max : 0;
      };

      if (reduced) {
        const onScroll = () => {
          syncFromWindow();
          ScrollTrigger.update();
        };
        const onResize = () => {
          viewportState.width = window.innerWidth;
          viewportState.height = window.innerHeight;
          viewportState.isMobile = window.innerWidth < 768;
          ScrollTrigger.refresh();
        };
        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onResize);
        syncFromWindow();
        ScrollTrigger.refresh();
        dispose = () => {
          window.removeEventListener("scroll", onScroll);
          window.removeEventListener("resize", onResize);
        };
        return;
      }

      const lenis = new Lenis({
        autoRaf: false,
        lerp: 0.075,
        smoothWheel: true,
        syncTouch: false,
        prevent: (node) =>
          node.hasAttribute("data-lenis-prevent") ||
          Boolean(node.closest("[data-lenis-prevent]")),
      });

      if (typeof window !== "undefined") {
        (window as unknown as { __lenis?: Lenis }).__lenis = lenis;
      }

      const onLenisScroll = (instance: Lenis) => {
        scrollState.progress = instance.progress;
        scrollState.velocity = instance.velocity;
        scrollState.scroll = instance.scroll;
      };

      lenis.on("scroll", ScrollTrigger.update);
      lenis.on("scroll", onLenisScroll);

      const ticker = (time: number) => {
        lenis.raf(time * 1000);
      };

      gsap.ticker.add(ticker);
      gsap.ticker.lagSmoothing(0);

      const onResize = () => {
        viewportState.width = window.innerWidth;
        viewportState.height = window.innerHeight;
        viewportState.isMobile = window.innerWidth < 768;
        ScrollTrigger.refresh();
      };

      window.addEventListener("resize", onResize);
      requestAnimationFrame(() => ScrollTrigger.refresh());

      dispose = () => {
        window.removeEventListener("resize", onResize);
        gsap.ticker.remove(ticker);
        lenis.off("scroll", ScrollTrigger.update);
        lenis.off("scroll", onLenisScroll);
        lenis.destroy();
      };
    });

    return () => {
      cancelled = true;
      dispose();
    };
  }, []);

  return children;
}
