"use client";

import { motion } from "framer-motion";
import { projects } from "@/data/projects";
import { Reveal } from "@/components/ui/Reveal";
import { Section, SectionKicker } from "@/components/ui/Section";
import { openIdentity } from "@/lib/identity-state";
import type { IdentityNodeId } from "@/types";

export function Projects() {
  return (
    <Section id="projects" labelledBy="projects-title">
      <Reveal>
        <SectionKicker>Work log / 03</SectionKicker>
        <h2
          id="projects-title"
          data-reveal
          className="max-w-3xl font-display text-3xl font-semibold tracking-tight text-slate-50 sm:text-5xl"
        >
          Operational work, stated as it is.
        </h2>
        <p data-reveal className="mt-4 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
          Entries below are drawn from the skills and infrastructure actually described — not from invented repositories, metrics, or live demos.
        </p>

        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <motion.li
              key={project.id}
              data-reveal
              whileHover={{ y: -6 }}
              transition={{ type: "spring", stiffness: 320, damping: 24 }}
              onClick={(e) => openIdentity(project.id as IdentityNodeId, e.clientX, e.clientY)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                  openIdentity(project.id as IdentityNodeId, rect.left + rect.width / 2, rect.top + rect.height / 2);
                }
              }}
              role="button"
              tabIndex={0}
              aria-label={`Open ${project.title} telemetry modal`}
              className="group glass-panel flex flex-col justify-between cursor-pointer rounded-2xl p-5 focus-within:ring-2 focus-within:ring-cyan-200/50 outline-none"
            >
              <article className="flex flex-col h-full justify-between outline-none">
                <div>
                  <div className="flex items-baseline justify-between gap-3 font-mono text-[10px] uppercase tracking-[0.24em] text-slate-500">
                    <span className="text-cyan-400/80 font-bold">{project.code}</span>
                    <span>{project.status}</span>
                  </div>
                  <h3 className="mt-4 font-display text-xl text-slate-50 group-hover:text-cyan-200 transition-colors">
                    {project.title}
                  </h3>
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-slate-400">
                    {project.domain}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-slate-400">{project.summary}</p>
                </div>
                <div>
                  <ul className="mt-5 flex flex-wrap gap-2">
                    {project.stack.map((item) => (
                      <li
                        key={item}
                        className="rounded-full border border-white/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-slate-300"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                  {project.links.length > 0 ? (
                    <ul className="mt-4 flex flex-wrap gap-3 border-t border-white/10 pt-3">
                      {project.links.map((link) => (
                        <li key={link.href}>
                          <a
                            href={link.href}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="font-mono text-[11px] uppercase tracking-[0.18em] text-cyan-200 underline-offset-4 hover:underline"
                          >
                            {link.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </article>
            </motion.li>
          ))}
        </ul>
      </Reveal>
    </Section>
  );
}
