"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";

export function Reveal({
  children,
  className,
  y = 28,
}: {
  children: ReactNode;
  className?: string;
  y?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    let revert: () => void = () => {};
    let active = true;

    void import("@/lib/gsap-client").then(({ getGsap }) => {
      if (!active || !ref.current) return;
      const { gsap } = getGsap();
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduced) return;

      const ctx = gsap.context(() => {
        gsap.fromTo(
          el.querySelectorAll("[data-reveal]"),
          { y, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1.05,
            ease: "power3.out",
            stagger: 0.08,
            scrollTrigger: {
              trigger: el,
              start: "top 78%",
              once: true,
            },
          },
        );
      }, el);

      revert = () => ctx.revert();
    });

    return () => {
      active = false;
      revert();
    };
  }, [y]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
