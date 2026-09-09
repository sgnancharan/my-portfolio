"use client";

import { motion, useAnimationControls } from "framer-motion";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { useTheme } from "@/components/providers/ThemeProvider";

// Sci-Fi Cybernetic Rune Glyphs for the Quantum Decrypt Scramble
const SCRAMBLE_GLYPHS = ["§", "⎔", "⏣", "⎈", "⏢", "Δ", "Σ", "∇", "0", "1", "X", "Z", "✦", "◈"];

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
}

const SPARKLE_COLORS_DARK = ["#38bdf8", "#818cf8", "#a78bfa", "#34d399", "#f8fafc"];
const SPARKLE_COLORS_LIGHT = ["#0284c7", "#6366f1", "#059669", "#d97706", "#0f172a"];

interface SqueezeCharacterProps {
  char: string;
  charIndex: number;
  registerTrigger: (index: number, trigger: () => void) => void;
  onCharacterInteraction: (clientX: number, clientY: number) => void;
  isScrambling: boolean;
}

function SqueezeCharacter({
  char,
  charIndex,
  registerTrigger,
  onCharacterInteraction,
  isScrambling,
}: SqueezeCharacterProps) {
  const controls = useAnimationControls();
  const [displayChar, setDisplayChar] = useState(char);
  const lastTriggerTime = useRef(0);
  const reduced = usePrefersReducedMotion();
  const { theme } = useTheme();
  const isLight = theme === "light";

  const baseColor = isLight ? "#090d16" : "#f8fafc";
  const hoverColor = isLight ? "#0284c7" : "#38bdf8";
  const midColor = isLight ? "#6366f1" : "#a78bfa";

  // Quantum Scramble effect
  useEffect(() => {
    if (!isScrambling || char === " ") {
      return;
    }

    let frame = 0;
    const maxFrames = 12 + (charIndex % 5) * 2;
    const interval = setInterval(() => {
      frame++;
      if (frame >= maxFrames) {
        setDisplayChar(char);
        clearInterval(interval);
      } else {
        const randomGlyph = SCRAMBLE_GLYPHS[Math.floor(Math.random() * SCRAMBLE_GLYPHS.length)];
        setDisplayChar(randomGlyph);
      }
    }, 38);

    return () => {
      clearInterval(interval);
      setDisplayChar(char);
    };
  }, [isScrambling, char, charIndex]);

  const triggerSqueeze = useCallback(
    (e?: React.PointerEvent | React.TouchEvent) => {
      if (reduced) return;
      const now = Date.now();
      if (now - lastTriggerTime.current < 180) return;
      lastTriggerTime.current = now;

      if (e && "clientX" in e && e.clientX) {
        onCharacterInteraction(e.clientX, e.clientY);
      }

      void controls.start({
        scaleX: [1, 0.58, 1.48, 0.82, 1.14, 1],
        scaleY: [1, 1.54, 0.60, 1.22, 0.90, 1],
        color: [
          baseColor,
          hoverColor,
          midColor,
          hoverColor,
          baseColor,
        ],
        textShadow: isLight
          ? [
              "0 0 0px rgba(2, 132, 199, 0)",
              "0 0 16px rgba(2, 132, 199, 0.3), 0 0 32px rgba(99, 102, 241, 0.2)",
              "0 0 8px rgba(2, 132, 199, 0.2)",
              "0 0 0px rgba(2, 132, 199, 0)",
            ]
          : [
              "0 0 0px rgba(56, 189, 248, 0)",
              "0 0 32px rgba(56, 189, 248, 0.98), 0 0 64px rgba(167, 139, 250, 0.7)",
              "0 0 18px rgba(56, 189, 248, 0.75)",
              "0 0 0px rgba(56, 189, 248, 0)",
            ],
        transition: {
          duration: 0.58,
          times: [0, 0.2, 0.44, 0.66, 0.86, 1],
          ease: "easeInOut",
        },
      });
    },
    [controls, reduced, onCharacterInteraction, baseColor, hoverColor, midColor, isLight],
  );

  useEffect(() => {
    registerTrigger(charIndex, () => triggerSqueeze());
  }, [charIndex, registerTrigger, triggerSqueeze]);

  return (
    <motion.span
      animate={controls}
      onPointerEnter={triggerSqueeze}
      onPointerMove={triggerSqueeze}
      onTouchStart={triggerSqueeze}
      className="inline-block cursor-pointer select-none will-change-transform transform-gpu px-[0.015em] transition-colors"
      style={{
        display: "inline-block",
        transformOrigin: "center center",
        color: baseColor,
      }}
    >
      {displayChar}
    </motion.span>
  );
}

interface JiggleTitleProps {
  text: string;
  className?: string;
  id?: string;
}

export function JiggleTitle({ text, className = "", id }: JiggleTitleProps) {
  const baseId = useId();
  const containerRef = useRef<HTMLHeadingElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animFrameRef = useRef<number | null>(null);
  const triggersRef = useRef<Map<number, () => void>>(new Map());
  const [isScrambling, setIsScrambling] = useState(false);

  const words = text.split(" ");
  let globalCharIndex = 0;

  const registerTrigger = useCallback((index: number, trigger: () => void) => {
    triggersRef.current.set(index, trigger);
  }, []);

  const startAnimationLoop = useCallback(() => {
    if (animFrameRef.current !== null) return;

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) {
        animFrameRef.current = null;
        return;
      }
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        animFrameRef.current = null;
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const particles = particlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.05; // tiny gravity
        p.life++;
        p.alpha = 1 - p.life / p.maxLife;

        if (p.life >= p.maxLife) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (1 - (p.life / p.maxLife) * 0.5), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      if (particles.length > 0) {
        animFrameRef.current = requestAnimationFrame(render);
      } else {
        animFrameRef.current = null;
      }
    };

    animFrameRef.current = requestAnimationFrame(render);
  }, []);

  const { theme } = useTheme();
  const isLight = theme === "light";
  const sparklePalette = isLight ? SPARKLE_COLORS_LIGHT : SPARKLE_COLORS_DARK;

  // Spawn glowing stardust sparks that float and disperse
  const spawnSparks = useCallback((clientX: number, clientY: number, count = 3, burst = false) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    for (let i = 0; i < count; i++) {
      const angle = burst ? Math.random() * Math.PI * 2 : (Math.random() - 0.5) * Math.PI;
      const speed = burst ? 2.5 + Math.random() * 4.5 : 1.2 + Math.random() * 2.8;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - (burst ? 0 : 1.2), // gentle upward float
        size: 2.2 + Math.random() * 3.2,
        color: sparklePalette[Math.floor(Math.random() * sparklePalette.length)],
        alpha: 1,
        life: 0,
        maxLife: burst ? 35 + Math.random() * 25 : 22 + Math.random() * 18,
      });
    }

    startAnimationLoop();
  }, [startAnimationLoop, sparklePalette]);

  // Sync canvas size on mount / resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;
      canvas.width = container.offsetWidth;
      canvas.height = container.offsetHeight;
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  // Supernova Click / Tap Wave: Radial spark blast + accordion wave
  const handleClick = (e: React.MouseEvent) => {
    spawnSparks(e.clientX, e.clientY, 24, true);

    const sorted = Array.from(triggersRef.current.entries()).sort((a, b) => a[0] - b[0]);
    sorted.forEach(([index, trigger]) => {
      window.setTimeout(() => {
        trigger();
      }, index * 32);
    });
  };

  // Double Click: Quantum Cyber Decrypt Scramble
  const handleDoubleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    spawnSparks(e.clientX, e.clientY, 32, true);
    setIsScrambling(true);
    setTimeout(() => setIsScrambling(false), 900);
  };

  return (
    <div className="relative inline-block">
      {/* 100% Lightweight Stardust Canvas Layer */}
      <canvas
        ref={canvasRef}
        className="absolute -inset-8 pointer-events-none z-20"
        style={{ width: "calc(100% + 4rem)", height: "calc(100% + 4rem)" }}
      />

      <h1
        ref={containerRef}
        id={id}
        className={`${className} relative z-10`}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        title="Glide mouse to squeeze & emit stardust · Click for Supernova · Double-click to Decrypt"
      >
        {words.map((word, wordIndex) => {
          const letters = Array.from(word);
          const wordKey = `${baseId}-word-${wordIndex}`;

          return (
            <span key={wordKey} className="inline-block whitespace-nowrap">
              {letters.map((char) => {
                const charIdx = globalCharIndex++;
                return (
                  <SqueezeCharacter
                    key={`${wordKey}-char-${charIdx}`}
                    char={char}
                    charIndex={charIdx}
                    registerTrigger={registerTrigger}
                    onCharacterInteraction={(x, y) => spawnSparks(x, y, 2)}
                    isScrambling={isScrambling}
                  />
                );
              })}
              {wordIndex < words.length - 1 && (
                <span className="inline-block w-[0.28em]">&nbsp;</span>
              )}
            </span>
          );
        })}
      </h1>
    </div>
  );
}
