"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, ExternalLink, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import {
  allIdentityNodes,
  identityNodes,
  profileIdentityNodes,
  projectIdentityNodes,
  skillIdentityNodes,
  PROFILE_PHOTO,
} from "@/data/identity-nodes";
import { profile } from "@/data/profile";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import {
  closeIdentity,
  identityInteraction,
  openIdentity,
  subscribeIdentity,
} from "@/lib/identity-state";
import { IdentityViz } from "@/components/identity/IdentityViz";
import type { IdentityNodeId } from "@/types";

function snapshot() {
  return identityInteraction.open ?? "";
}

export function IdentityModal({ onClose = closeIdentity }: { onClose?: () => void }) {
  const openId = useSyncExternalStore(subscribeIdentity, snapshot, () => "");
  const reduced = usePrefersReducedMotion();
  const dialog = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const restore = useRef<HTMLElement | null>(null);

  const activeNodes = profileIdentityNodes.some((item) => item.id === openId)
    ? profileIdentityNodes
    : skillIdentityNodes.some((item) => item.id === openId)
      ? skillIdentityNodes
      : projectIdentityNodes.some((item) => item.id === openId)
        ? projectIdentityNodes
        : allIdentityNodes;

  const node = activeNodes.find((item) => item.id === openId) ?? allIdentityNodes.find((item) => item.id === openId);
  const currentIndex = activeNodes.findIndex((item) => item.id === openId);

  const safeIndex = currentIndex >= 0 ? currentIndex : 0;
  const prevIndex = safeIndex > 0 ? safeIndex - 1 : activeNodes.length - 1;
  const nextIndex = safeIndex < activeNodes.length - 1 ? safeIndex + 1 : 0;
  const prevNode = activeNodes[prevIndex] ?? node;
  const nextNode = activeNodes[nextIndex] ?? node;

  useEffect(() => {
    if (!openId) return;
    restore.current = document.activeElement as HTMLElement | null;
    const id = window.setTimeout(() => closeBtn.current?.focus(), 40);

    // Lock body scroll behind modal without causing horizontal scrollbar layout jump
    const originalHtmlOverflow = document.documentElement.style.overflow;
    const originalBodyOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    // Reset scroll to top when opening a node
    if (dialog.current) {
      dialog.current.scrollTop = 0;
    }

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key === "ArrowLeft") {
        if (!prevNode) return;
        event.preventDefault();
        openIdentity(prevNode.id, window.innerWidth / 2, window.innerHeight / 2);
        return;
      }
      if (event.key === "ArrowRight") {
        if (!nextNode) return;
        event.preventDefault();
        openIdentity(nextNode.id, window.innerWidth / 2, window.innerHeight / 2);
        return;
      }
      if (event.key !== "Tab" || !dialog.current) return;
      const focusable = [
        ...dialog.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        ),
      ].filter((el) => !el.hasAttribute("disabled"));
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(id);
      window.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = originalHtmlOverflow;
      document.body.style.overflow = originalBodyOverflow;
      document.body.style.paddingRight = originalPaddingRight;
      restore.current?.focus();
    };
  }, [openId, onClose, prevNode, nextNode]);

  if (typeof document === "undefined") return null;

  const ox = identityInteraction.originX || (typeof window !== "undefined" ? window.innerWidth / 2 : 0);
  const oy = identityInteraction.originY || (typeof window !== "undefined" ? window.innerHeight / 2 : 0);
  const isCoreModal = node?.id === "core";

  return createPortal(
    <AnimatePresence>
      {node ? (
        <motion.div
          className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-6"
          data-lenis-prevent="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduced ? 0.01 : 0.28 }}
        >
          {/* Backdrop Click Dismiss */}
          <button
            type="button"
            className="absolute inset-0 bg-[#03060c]/80 backdrop-blur-lg"
            aria-label="Close modal backdrop"
            onClick={onClose}
          />

          {/* Modal Container */}
          <motion.div
            ref={dialog}
            id="identity-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="identity-modal-title"
            aria-describedby="identity-modal-body"
            data-lenis-prevent="true"
            tabIndex={-1}
            className="identity-modal relative max-h-[min(92vh,780px)] w-full max-w-3xl overflow-y-auto overscroll-contain rounded-2xl sm:rounded-3xl border border-cyan-200/20 bg-slate-950/90 shadow-[0_30px_90px_rgba(0,0,0,0.85)] outline-none will-change-transform transform-gpu"
            style={{ ["--modal-accent" as string]: node.color }}
            initial={
              reduced
                ? { opacity: 0 }
                : {
                  opacity: 0,
                  scale: 0.92,
                  y: 18,
                }
            }
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={
              reduced
                ? { opacity: 0 }
                : {
                  opacity: 0,
                  scale: 0.95,
                  y: 12,
                }
            }
            transition={{ duration: reduced ? 0.01 : 0.32, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 border-b border-white/10 px-5 py-4 sm:px-8 sm:py-5 sticky top-0 bg-slate-950/95 backdrop-blur-md z-10">
              <div className="flex items-center gap-3">
                <span
                  className="h-3 w-3 rounded-full shadow-[0_0_12px_var(--modal-accent)]"
                  style={{ backgroundColor: node.color }}
                  aria-hidden
                />
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-cyan-200/70">
                    {node.id === "core"
                      ? `${node.kicker} // NODE 00`
                      : `${node.kicker} // NODE 0${safeIndex + 1}`}
                  </p>
                  <h2
                    id="identity-modal-title"
                    className="mt-1 font-display text-2xl sm:text-3xl font-semibold tracking-tight text-slate-50"
                  >
                    {node.label}
                  </h2>
                </div>
              </div>
              <button
                ref={closeBtn}
                type="button"
                onClick={onClose}
                className="inline-flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full border border-white/15 text-slate-200 hover:border-cyan-300 hover:text-cyan-300 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 cursor-pointer"
              >
                <X size={18} aria-hidden />
                <span className="sr-only">Close (Escape)</span>
              </button>
            </div>

            {/* Core Operator Dossier View */}
            {isCoreModal ? (
              <div className="p-5 sm:p-8">
                <div className="grid gap-6 md:grid-cols-[220px_1fr] items-start">
                  {/* Portrait with Holographic Server Theme */}
                  <div className="relative mx-auto w-48 sm:w-full aspect-[4/5] rounded-2xl overflow-hidden border border-cyan-200/30 shadow-[0_0_35px_rgba(56,189,248,0.25)]">
                    <Image
                      src={PROFILE_PHOTO}
                      alt={`${profile.name} - Systems & AI operator in server laboratory`}
                      width={640}
                      height={800}
                      priority
                      unoptimized
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                    <div className="absolute bottom-2.5 inset-x-2.5 text-center">
                      <span className="inline-block px-2 py-0.5 rounded-full font-mono text-[9px] uppercase tracking-widest bg-cyan-950/80 text-cyan-200 border border-cyan-400/30 backdrop-blur-sm">
                        OPERATOR 00 · VERIFIED
                      </span>
                    </div>
                  </div>

                  {/* Operator Bio & Philosophy */}
                  <div>
                    <h3 className="font-display text-xl sm:text-2xl text-slate-100 font-medium">
                      {profile.name}
                    </h3>
                    <p className="mt-1 font-mono text-xs uppercase tracking-[0.16em] text-cyan-300">
                      {profile.study} · Nadimpalli Satyanarayana Raju Institute of Technology, AP
                    </p>
                    <p id="identity-modal-body" className="mt-4 text-sm leading-relaxed text-slate-300">
                      {node.body}
                    </p>

                    {/* Linked Subsystems Quick Navigator */}
                    <div className="mt-5">
                      <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-slate-400">
                        Linked Computational Subsystems
                      </p>
                      <div className="mt-2.5 flex flex-wrap gap-2">
                        {identityNodes.map((subNode) => (
                          <button
                            key={subNode.id}
                            type="button"
                            onClick={() => openIdentity(subNode.id, ox, oy)}
                            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 font-mono text-xs text-slate-200 hover:border-cyan-300 hover:bg-cyan-950/40 transition cursor-pointer"
                          >
                            <span
                              className="h-2 w-2 rounded-full"
                              style={{ backgroundColor: subNode.color }}
                              aria-hidden
                            />
                            {subNode.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="mt-6 flex flex-wrap items-center gap-3">
                      <a
                        href={profile.github}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2 font-mono text-xs uppercase tracking-wider text-slate-200 hover:border-cyan-300 transition"
                      >
                        GitHub Profile
                        <ExternalLink size={13} aria-hidden />
                      </a>
                      <a
                        href="#contact"
                        onClick={onClose}
                        className="inline-flex items-center gap-2 rounded-full border border-cyan-400/40 bg-cyan-950/60 px-4 py-2 font-mono text-xs uppercase tracking-wider text-cyan-200 hover:bg-cyan-900/60 transition"
                      >
                        Transmit Dispatch
                      </a>
                    </div>
                  </div>
                </div>

                <div className="mt-6 border-t border-white/10 pt-6">
                  <IdentityViz id="core" color={node.color} />
                </div>
              </div>
            ) : (
              /* Peripheral Node Breakdown (Skills, Projects, Systems, AI) */
              <div className="grid gap-6 p-5 sm:p-8 md:grid-cols-[1.05fr_0.95fr]">
                <div>
                  <p className="text-base font-medium leading-relaxed text-cyan-100/95">
                    {node.summary}
                  </p>
                  <p id="identity-modal-body" className="mt-4 text-sm leading-relaxed text-slate-300">
                    {node.body}
                  </p>

                  {/* Key Concepts */}
                  <div className="mt-5">
                    <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-slate-400">
                      Core Concepts
                    </p>
                    <ul className="mt-2 space-y-2 text-sm text-slate-300">
                      {node.concepts.map((item) => (
                        <li key={item} className="flex items-start gap-2.5">
                          <span
                            className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                            style={{ backgroundColor: node.color }}
                            aria-hidden
                          />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Technologies */}
                  <div className="mt-5">
                    <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-slate-400">
                      Active Technologies
                    </p>
                    <ul className="mt-2 flex flex-wrap gap-2">
                      {node.technologies.map((item) => (
                        <li
                          key={item}
                          className="rounded-full border border-white/15 bg-white/5 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-slate-200"
                        >
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Custom Interactive Visualization */}
                <div>
                  <IdentityViz id={node.id as IdentityNodeId} color={node.color} />
                </div>
              </div>
            )}

            {/* Footer Navigation Switcher */}
            {prevNode && nextNode && (
              <div className="flex items-center justify-between border-t border-white/10 px-5 py-3.5 sm:px-8 bg-slate-950/90 sticky bottom-0 z-10">
                <button
                  type="button"
                  onClick={() => openIdentity(prevNode.id, ox, oy)}
                  className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 font-mono text-xs text-slate-300 hover:text-cyan-300 hover:bg-white/5 transition cursor-pointer"
                >
                  <ArrowLeft size={14} aria-hidden />
                  <span>{prevNode.label}</span>
                </button>
                <span className="hidden sm:inline font-mono text-[10px] text-slate-500 uppercase tracking-widest">
                  [ ← / → ARROW KEYS ]
                </span>
                <button
                  type="button"
                  onClick={() => openIdentity(nextNode.id, ox, oy)}
                  className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 font-mono text-xs text-slate-300 hover:text-cyan-300 hover:bg-white/5 transition cursor-pointer"
                >
                  <span>{nextNode.label}</span>
                  <ArrowRight size={14} aria-hidden />
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
