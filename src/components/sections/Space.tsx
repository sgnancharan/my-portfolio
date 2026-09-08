import { Reveal } from "@/components/ui/Reveal";
import { Section, SectionKicker } from "@/components/ui/Section";

const threads = [
  {
    title: "Astronomy as observation",
    body: "Looking outward is a data problem as much as a wonder problem: signal, noise, distance, and the discipline of not inventing what you cannot yet measure.",
  },
  {
    title: "Computing as instrument",
    body: "Linux hosts, containers, and isolated workloads are how I currently practice control systems on Earth — the same instincts simulation and ground software demand.",
  },
  {
    title: "Engineering as patience",
    body: "Space technology is a longer horizon, not a title I hold. I study systems so that interest has somewhere precise to land.",
  },
];

export function Space() {
  return (
    <Section id="space" labelledBy="space-title">
      <Reveal>
        <SectionKicker>Horizon / 04</SectionKicker>
        <h2
          id="space-title"
          data-reveal
          className="max-w-4xl font-display text-3xl font-semibold tracking-tight text-slate-50 sm:text-5xl"
        >
          SPACE IS THE LONGER HORIZON.
        </h2>
        <p data-reveal className="mt-6 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
          Astronomy and space technology sit beside the infrastructure work, not on top of it as branding. The through-line is systems: how a machine is isolated, how a signal is trusted, how a simulation stays honest.
        </p>
        <ul className="mt-12 grid gap-4 md:grid-cols-3">
          {threads.map((thread) => (
            <li key={thread.title} data-reveal className="glass-panel rounded-2xl p-5">
              <h3 className="font-display text-lg text-slate-50">{thread.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-400">{thread.body}</p>
            </li>
          ))}
        </ul>
      </Reveal>
    </Section>
  );
}
