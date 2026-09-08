import { profile } from "@/data/profile";
import { Reveal } from "@/components/ui/Reveal";
import { Section, SectionKicker } from "@/components/ui/Section";

export function About() {
  return (
    <Section id="about" labelledBy="about-title">
      <Reveal>
        <SectionKicker>Telemetry / 01</SectionKicker>
        <h2
          id="about-title"
          data-reveal
          className="max-w-4xl font-display text-3xl font-semibold tracking-tight text-slate-50 sm:text-5xl"
        >
          {profile.aboutHeadline}
        </h2>
        <div className="mt-10 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div
            data-reveal
            className="glass-panel rounded-2xl p-6 sm:p-8 space-y-5 text-base leading-7 text-slate-200 sm:text-lg sm:leading-8"
          >
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.24em] text-cyan-200/80 mb-1">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
              <span>Core Profile // Mission Architecture</span>
            </div>
            {profile.aboutBody.map((paragraph) => (
              <p key={paragraph.slice(0, 24)} className="text-slate-300">
                {paragraph}
              </p>
            ))}
          </div>
          <aside
            data-reveal
            className="glass-panel relative overflow-hidden rounded-2xl p-6 sm:p-8 flex flex-col justify-between"
            aria-label="Profile telemetry"
          >
            <div>
              <div className="mb-4 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.28em] text-cyan-100/70">
                <span className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                  Node Status
                </span>
                <span className="inline-flex items-center gap-2 text-emerald-300/80">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-300" />
                  Telemetry Active
                </span>
              </div>
              <dl className="divide-y divide-white/10 border-t border-white/10">
                {profile.telemetry.map((row) => (
                  <div
                    key={row.label}
                    className="grid grid-cols-[7.5rem_1fr] gap-3 py-3.5 font-mono text-[11px] uppercase tracking-[0.16em] sm:grid-cols-[8.5rem_1fr]"
                  >
                    <dt className="text-slate-400 font-medium">{row.label}</dt>
                    <dd className="text-slate-100 font-semibold">{row.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.2em] text-slate-400">
              <span>Telemetry Uplink</span>
              <span className="text-cyan-300">Synchronized</span>
            </div>
          </aside>
        </div>
      </Reveal>
    </Section>
  );
}
