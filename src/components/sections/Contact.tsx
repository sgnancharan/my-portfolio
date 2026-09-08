"use client";

import { useId, useState, type FormEvent, type ReactNode } from "react";
import { Check, Copy, ExternalLink, Mail, MessageSquare, Send } from "lucide-react";
import { emptyContactForm, validateContact } from "@/lib/validate-contact";
import { socials } from "@/data/profile";
import { Reveal } from "@/components/ui/Reveal";
import { Section, SectionKicker } from "@/components/ui/Section";
import type { ContactFormState } from "@/types";

const TARGET_EMAIL = "sgnancharan730@gmail.com";
const TARGET_PHONE = "+91 9346528844";
const TARGET_WA_NUM = "919346528844";

const DIRECT_CONTACTS = {
  whatsapp: {
    label: TARGET_PHONE,
    href: `https://wa.me/${TARGET_WA_NUM}`,
  },
  email: {
    label: TARGET_EMAIL,
    href: `mailto:${TARGET_EMAIL}`,
  },
};

export function Contact() {
  const formId = useId();
  const [values, setValues] = useState<ContactFormState>(emptyContactForm);
  const [errors, setErrors] = useState(validateContact(emptyContactForm));
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [attempted, setAttempted] = useState(false);
  const [copied, setCopied] = useState(false);

  const show = attempted ? errors : {};

  function buildPayload() {
    const callsign = values.name.trim() || "Anonymous Operator";
    const uplink = values.email.trim() || "Not provided";
    const intent = values.intent.trim() || "Transmission Intent";
    const payload = values.message.trim() || "No message body provided.";

    const subject = `[Dispatch] ${intent} - from ${callsign}`;
    const body = `OPERATOR CALLSIGN: ${callsign}\nCONTACT UPLINK: ${uplink}\nINTENT / TOPIC: ${intent}\n\nTRANSMISSION PAYLOAD:\n${payload}\n\n---\nRouted to: ${TARGET_EMAIL}`;

    return { subject, body, intent, callsign, uplink, payload };
  }

  // Direct Webmail (Gmail Compose) - 100% reliable in any web browser without local mail client
  function handleGmailMe(e?: FormEvent) {
    if (e) e.preventDefault();
    setAttempted(true);

    const { subject, body } = buildPayload();
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(TARGET_EMAIL)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    window.open(gmailUrl, "_blank", "noopener,noreferrer");
    setStatusMessage(`Opening Gmail compose addressed to ${TARGET_EMAIL}...`);
  }

  // Native Default Mail Client (mailto: protocol)
  function handleEmailClient(e?: FormEvent) {
    if (e) e.preventDefault();
    setAttempted(true);

    const { subject, body } = buildPayload();
    const mailtoUrl = `mailto:${TARGET_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    const a = document.createElement("a");
    a.href = mailtoUrl;
    a.click();
    setStatusMessage(`Triggering default email application for ${TARGET_EMAIL}...`);
  }

  // Instant WhatsApp Dispatch
  function handleWhatsAppMe(e?: FormEvent) {
    if (e) e.preventDefault();
    setAttempted(true);

    const { intent, callsign, uplink, payload } = buildPayload();
    const rawMessage = `*TRANSMISSION TO ${TARGET_EMAIL}*\n\n*INTENT:* ${intent}\n*CALLSIGN:* ${callsign}\n*UPLINK:* ${uplink}\n\n*PAYLOAD:*\n${payload}`;
    const waUrl = `https://wa.me/${TARGET_WA_NUM}?text=${encodeURIComponent(rawMessage)}`;

    window.open(waUrl, "_blank", "noopener,noreferrer");
    setStatusMessage("Opening WhatsApp with formatted transmission payload...");
  }

  // Copy email address directly
  function handleCopyEmail() {
    navigator.clipboard.writeText(TARGET_EMAIL).then(() => {
      setCopied(true);
      setStatusMessage(`Copied ${TARGET_EMAIL} to clipboard!`);
      setTimeout(() => setCopied(false), 2400);
    });
  }

  function setField<K extends keyof ContactFormState>(key: K, value: ContactFormState[K]) {
    setValues((current) => {
      const next = { ...current, [key]: value };
      setErrors(validateContact(next));
      return next;
    });
  }

  return (
    <Section id="contact" labelledBy="contact-title">
      <Reveal>
        <SectionKicker>Transmission / 05</SectionKicker>
        <h2
          id="contact-title"
          data-reveal
          className="max-w-3xl font-display text-3xl font-semibold tracking-tight text-slate-50 sm:text-5xl"
        >
          Open a channel.
        </h2>
        <p data-reveal className="mt-4 max-w-xl text-sm leading-6 text-slate-400">
          Prepare your transmission below. All messages route directly to{" "}
          <strong className="text-cyan-300 font-mono">{TARGET_EMAIL}</strong> via direct Gmail compose, default email client, or instant WhatsApp dispatch.
        </p>

        <div className="mt-12 grid gap-10 lg:grid-cols-[1.15fr_0.85fr]">
          {/* Transmission Form */}
          <form
            data-reveal
            noValidate
            onSubmit={handleGmailMe}
            className="glass-panel rounded-3xl p-5 sm:p-8 border border-white/10 bg-slate-950/80 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.6)]"
            aria-describedby={`${formId}-note`}
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <Field id={`${formId}-name`} label="CALLSIGN" error={show.name}>
                <input
                  id={`${formId}-name`}
                  name="name"
                  autoComplete="name"
                  placeholder="Your Name / Handle"
                  value={values.name}
                  aria-invalid={Boolean(show.name)}
                  aria-describedby={show.name ? `${formId}-name-error` : undefined}
                  onChange={(event) => setField("name", event.target.value)}
                  className="field-input font-mono text-sm"
                />
              </Field>

              <Field id={`${formId}-email`} label="UPLINK" error={show.email}>
                <input
                  id={`${formId}-email`}
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="your.email@network.domain"
                  value={values.email}
                  aria-invalid={Boolean(show.email)}
                  aria-describedby={show.email ? `${formId}-email-error` : undefined}
                  onChange={(event) => setField("email", event.target.value)}
                  className="field-input font-mono text-sm"
                />
              </Field>
            </div>

            <Field id={`${formId}-intent`} label="INTENT" error={show.intent}>
              <input
                id={`${formId}-intent`}
                name="intent"
                placeholder="Subject / Systems Consultation / Collaboration"
                value={values.intent}
                aria-invalid={Boolean(show.intent)}
                aria-describedby={show.intent ? `${formId}-intent-error` : undefined}
                onChange={(event) => setField("intent", event.target.value)}
                className="field-input font-mono text-sm"
              />
            </Field>

            <Field id={`${formId}-message`} label="PAYLOAD" error={show.message}>
              <textarea
                id={`${formId}-message`}
                name="message"
                rows={5}
                placeholder="Transmission details, project specifications, or message..."
                value={values.message}
                aria-invalid={Boolean(show.message)}
                aria-describedby={show.message ? `${formId}-message-error` : undefined}
                onChange={(event) => setField("message", event.target.value)}
                className="field-input min-h-32 resize-y font-mono text-sm leading-relaxed"
              />
            </Field>

            <p id={`${formId}-note`} className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-400">
              Direct telemetry destination: <span className="text-cyan-300">{TARGET_EMAIL}</span>
            </p>

            {/* Direct Transmission Actions */}
            <div className="mt-6 flex flex-wrap gap-3 items-center">
              {/* Primary: Send via Gmail */}
              <button
                type="button"
                onClick={handleGmailMe}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-cyan-400/60 bg-cyan-950/60 px-5 py-3 font-mono text-xs uppercase tracking-[0.18em] text-cyan-200 transition hover:bg-cyan-900/80 hover:border-cyan-300 hover:shadow-[0_0_24px_rgba(56,189,248,0.4)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 active:scale-98"
              >
                <Mail size={15} className="text-cyan-300" aria-hidden />
                <span>Send via Gmail</span>
                <ExternalLink size={12} className="opacity-70" />
              </button>

              {/* Secondary: Default Email Client */}
              <button
                type="button"
                onClick={handleEmailClient}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-3 font-mono text-xs uppercase tracking-[0.16em] text-slate-200 transition hover:border-cyan-300 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 active:scale-98"
              >
                <Mail size={14} className="text-slate-300" aria-hidden />
                <span>Mail App</span>
              </button>

              {/* WhatsApp */}
              <button
                type="button"
                onClick={handleWhatsAppMe}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-950/40 px-4 py-3 font-mono text-xs uppercase tracking-[0.16em] text-emerald-200 transition hover:bg-emerald-900/60 hover:border-emerald-300 hover:shadow-[0_0_20px_rgba(52,211,153,0.3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 active:scale-98"
              >
                <MessageSquare size={14} className="text-emerald-300" aria-hidden />
                <span>WhatsApp</span>
              </button>

              {/* Copy Email */}
              <button
                type="button"
                onClick={handleCopyEmail}
                className="inline-flex items-center justify-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-3 font-mono text-xs uppercase tracking-wider text-slate-300 transition hover:text-cyan-200 hover:border-cyan-400/40"
                title="Copy sgnancharan730@gmail.com"
              >
                {copied ? (
                  <>
                    <Check size={13} className="text-emerald-400" />
                    <span className="text-[11px] text-emerald-300">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy size={13} />
                    <span className="text-[11px]">Copy Email</span>
                  </>
                )}
              </button>
            </div>

            {statusMessage ? (
              <p role="status" className="mt-4 font-mono text-xs text-cyan-300/90 flex items-center gap-2">
                <Send size={13} className="animate-pulse" />
                <span>{statusMessage}</span>
              </p>
            ) : null}
          </form>

          {/* Direct Channels & Profiles */}
          <aside data-reveal className="space-y-6">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-cyan-200/80 mb-3">
                DIRECT CHANNELS
              </p>
              <ul className="space-y-3">
                {/* Email Box */}
                <li className="rounded-2xl border border-cyan-400/30 bg-cyan-950/20 p-4 transition hover:border-cyan-300">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Mail size={18} className="text-cyan-400" />
                      <div>
                        <p className="font-mono text-[10px] uppercase tracking-wider text-cyan-300/80">
                          PRIMARY EMAIL
                        </p>
                        <p className="font-mono text-sm font-semibold text-slate-100">{TARGET_EMAIL}</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2 border-t border-white/10 pt-3">
                    <button
                      type="button"
                      onClick={handleGmailMe}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-cyan-400/30 bg-cyan-900/30 py-2 font-mono text-[11px] uppercase tracking-wider text-cyan-200 hover:bg-cyan-900/60 transition"
                    >
                      <span>Gmail Compose</span>
                      <ExternalLink size={11} />
                    </button>
                    <button
                      type="button"
                      onClick={handleCopyEmail}
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 py-2 font-mono text-[11px] text-slate-300 hover:text-white hover:border-white/30 transition"
                    >
                      {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                      <span>{copied ? "Copied" : "Copy"}</span>
                    </button>
                  </div>
                </li>

                {/* WhatsApp Box */}
                <li>
                  <a
                    href={DIRECT_CONTACTS.whatsapp.href}
                    target="_blank"
                    rel="noreferrer"
                    className="group flex items-center justify-between rounded-2xl border border-emerald-400/30 bg-emerald-950/20 px-4 py-3.5 text-sm text-slate-100 transition hover:border-emerald-300 hover:bg-emerald-950/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
                  >
                    <div className="flex items-center gap-3">
                      <MessageSquare size={18} className="text-emerald-400" />
                      <div>
                        <p className="font-mono text-[10px] uppercase tracking-wider text-emerald-300/80">WHATSAPP</p>
                        <p className="font-mono text-sm font-semibold text-slate-100">{DIRECT_CONTACTS.whatsapp.label}</p>
                      </div>
                    </div>
                    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-emerald-400 group-hover:translate-x-0.5 transition-transform">
                      CHAT →
                    </span>
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-slate-500 mb-3">
                PUBLIC PROFILES
              </p>
              <ul className="space-y-2.5">
                {socials.map((social) => (
                  <li key={social.id}>
                    <a
                      href={social.href}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between rounded-xl border border-white/10 px-4 py-2.5 text-sm text-slate-300 transition hover:border-cyan-200/30 hover:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/70"
                    >
                      <span className="font-mono text-xs">{social.label}</span>
                      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">
                        EXTERNAL
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </Reveal>
    </Section>
  );
}

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: ReactNode;
}) {
  const errorId = `${id}-error`;
  return (
    <div className="mt-0 flex flex-col gap-2 sm:col-span-1 sm:[&:has(textarea)]:col-span-2">
      <label htmlFor={id} className="font-mono text-[10px] uppercase tracking-[0.22em] text-cyan-200/80 font-medium">
        {label}
      </label>
      {children}
      {error ? (
        <p id={errorId} role="alert" className="font-mono text-xs text-rose-300/90">
          {error}
        </p>
      ) : null}
    </div>
  );
}
