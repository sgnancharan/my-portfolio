import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Section({
  id,
  children,
  className,
  labelledBy,
}: {
  id: string;
  children: ReactNode;
  className?: string;
  labelledBy: string;
}) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={cn(
        "relative z-10 mx-auto w-full max-w-6xl px-5 py-24 sm:px-8 md:py-32 lg:px-10 pointer-events-none",
        className,
      )}
    >
      <div className="pointer-events-auto">{children}</div>
    </section>
  );
}

export function SectionKicker({ children }: { children: ReactNode }) {
  return (
    <p
      data-reveal
      className="mb-3 font-mono text-[11px] uppercase tracking-[0.32em] text-cyan-100/70"
    >
      {children}
    </p>
  );
}
