"use client";

import { motion } from "framer-motion";
import { skills } from "@/data/skills";
import { Reveal } from "@/components/ui/Reveal";
import { Section, SectionKicker } from "@/components/ui/Section";
import { openIdentity } from "@/lib/identity-state";
import type { IdentityNodeId } from "@/types";

export function Skills() {
  return (
    <Section id="skills" labelledBy="skills-title">
      <Reveal>
        <SectionKicker>Capability matrix / 02</SectionKicker>
        <h2
          id="skills-title"
          data-reveal
          className="max-w-3xl font-display text-3xl font-semibold tracking-tight text-slate-50 sm:text-5xl"
        >
          Systems vocabulary, not a badge wall.
        </h2>
        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {skills.map((skill, index) => (
            <motion.li
              key={skill.id}
              data-reveal
              whileHover={{ y: -6 }}
              transition={{ type: "spring", stiffness: 320, damping: 24 }}
              onClick={(e) => openIdentity(skill.id as IdentityNodeId, e.clientX, e.clientY)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                  openIdentity(skill.id as IdentityNodeId, rect.left + rect.width / 2, rect.top + rect.height / 2);
                }
              }}
              role="button"
              tabIndex={0}
              aria-label={`Open ${skill.title} telemetry modal`}
              className="group glass-panel cursor-pointer rounded-2xl p-5 focus-within:ring-2 focus-within:ring-cyan-200/50 outline-none"
            >
              <article className="outline-none">
                <div className="flex items-baseline justify-between gap-3 font-mono text-[10px] uppercase tracking-[0.24em] text-slate-500">
                  <span>{skill.index}</span>
                  <span>0{index + 1}/07</span>
                </div>
                <h3 className="mt-4 font-display text-xl text-slate-50 group-hover:text-cyan-200 transition-colors">
                  {skill.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-slate-400">{skill.summary}</p>
                <ul className="mt-5 flex flex-wrap gap-2">
                  {skill.signals.map((signal) => (
                    <li
                      key={signal}
                      className="rounded-full border border-white/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-slate-300"
                    >
                      {signal}
                    </li>
                  ))}
                </ul>
              </article>
            </motion.li>
          ))}
        </ul>
      </Reveal>
    </Section>
  );
}
