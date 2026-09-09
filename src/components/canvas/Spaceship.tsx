"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import {
  AdditiveBlending,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
} from "three";
import { sampleCameraPath } from "@/lib/camera-path";
import { pointerState, scrollState, viewportState } from "@/lib/scroll-state";

const PARTICLE_OFFSETS = Array.from({ length: 16 }, (_, idx) => {
  const seed = (idx + 1) * 17.31;
  const pseudo1 = Math.sin(seed) * 10000;
  const pseudo2 = Math.cos(seed * 1.5) * 10000;
  const pseudo3 = Math.sin(seed * 2.3) * 10000;
  const r1 = pseudo1 - Math.floor(pseudo1);
  const r2 = pseudo2 - Math.floor(pseudo2);
  const r3 = pseudo3 - Math.floor(pseudo3);
  return {
    x: (r1 - 0.5) * 0.45,
    z: (r2 - 0.5) * 0.45,
    speed: 2.2 + r3 * 2.2,
    phase: r1 * Math.PI * 2,
    ship: idx % 2 === 0 ? ("starship" as const) : ("isro" as const),
  };
});

export function Spaceship() {
  const starshipRoot = useRef<Group>(null);
  const isroRoot = useRef<Group>(null);

  // Flame Groups (Anchored strictly at nozzle exit lips so flame expands ONLY downward)
  const starshipFlameGroup = useRef<Group>(null);
  const isroCoreFlameGroup = useRef<Group>(null);
  const isroBoosterFlameGroupL = useRef<Group>(null);
  const isroBoosterFlameGroupR = useRef<Group>(null);

  // Shock diamonds
  const starshipDiamonds = useRef<Mesh[]>([]);
  const isroDiamonds = useRef<Mesh[]>([]);

  // Collected materials for smooth, gradual fade-out AFTER tilting and entering the name
  const materialsRef = useRef<(MeshStandardMaterial | MeshBasicMaterial)[]>([]);

  useEffect(() => {
    const mats: (MeshStandardMaterial | MeshBasicMaterial)[] = [];
    const prepareMaterials = (root: Group | null) => {
      if (!root) return;
      root.traverse((child) => {
        if ((child as Mesh).isMesh) {
          const mesh = child as Mesh;
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((m) => {
              m.transparent = true;
              m.opacity = 1;
              m.needsUpdate = true;
              mats.push(m as MeshStandardMaterial | MeshBasicMaterial);
            });
          } else if (mesh.material) {
            mesh.material.transparent = true;
            mesh.material.opacity = 1;
            mesh.material.needsUpdate = true;
            mats.push(mesh.material as MeshStandardMaterial | MeshBasicMaterial);
          }
        }
      });
    };
    prepareMaterials(starshipRoot.current);
    prepareMaterials(isroRoot.current);
    materialsRef.current = mats;
  }, []);

  // Optimized lightweight exhaust sparks
  const particles = useRef<Mesh[]>([]);
  const particleOffsets = PARTICLE_OFFSETS;

  useFrame((state, delta) => {
    const star = starshipRoot.current;
    const isro = isroRoot.current;
    if (!star || !isro) return;

    const t = state.clock.elapsedTime;
    const progress = Math.min(1, Math.max(0, scrollState.progress));
    const isMobile = viewportState.isMobile;
    const reduced = viewportState.reducedMotion;

    // Camera spline tracking: ensures zero lag and perfect framing across all scroll depths
    const camPath = sampleCameraPath(progress);
    const camScale = isMobile ? 0.82 : 1;
    const camX = camPath.position[0] * camScale;
    const camY = camPath.position[1];
    const camZ = camPath.position[2];

    // ==========================================
    // LIFECYCLE & DYNAMICS:
    // 1. Progress = 0: Spaceships wait outside the screen
    // 2. On scroll: Fire from outside the screen into "S. Gnan Charan"
    // 3. Fully visible, uncut: whole rockets rendered intact
    // 4. At name: Tilts toward the name with thrusters facing user
    // 5. After that: Slowly and smoothly disappears into the typography
    // 6. Past 0.078: Completely gone/unloaded (no need in About section)
    // ==========================================
    const tiltStart = 0.024;
    const tiltEnd = 0.046;
    const disappearEnd = 0.078;

    const isPastName = progress >= disappearEnd;
    star.visible = !isPastName;
    isro.visible = !isPastName;

    if (isPastName) {
      // Early exit: completely skip all calculations once inside the name
      particles.current.forEach((p) => {
        if (p) p.visible = false;
      });
      return;
    }

    // Name altitude in world space
    const nameY = camY - 0.20;

    // Full speed throttle boost
    const velocity = Math.abs(scrollState.velocity || 0);
    const scrollActivation = Math.min(1, Math.max(0, progress / 0.015));
    const maxSpeedThrust = 1.0 + scrollActivation * 1.6 + Math.min(1.2, velocity * 0.25);

    // ==========================================
    // 1. FLY IN FROM OUTSIDE THE SCREEN:
    // At start (progress = 0), rockets are completely outside the visible screen borders
    // ==========================================
    const flyInRatio = Math.min(1, progress / tiltEnd);
    const easedFlyIn = Math.pow(flyInRatio, 0.88);

    // Outside screen lateral coordinates:
    const startSpread = isMobile ? 3.6 : 6.8; // far outside left & right screen edges
    const targetSpread = isMobile ? 0.38 : 0.68; // directly at the name letters
    const currentSpread = startSpread - easedFlyIn * (startSpread - targetSpread);

    const starTargetX = camX - currentSpread + (reduced ? 0 : pointerState.x * 0.12);
    const isroTargetX = camX + currentSpread + (reduced ? 0 : pointerState.x * 0.12);

    // Height: ascends from lower outside screen up to the name
    const startY = camY - 2.85;
    const baseY = startY + easedFlyIn * (nameY - startY);

    // ==========================================
    // 2. TILT TOWARD NAME WITH THRUSTERS FACING USER:
    // Smoothly rotates so nose points into name, thrusters face the user
    // ==========================================
    const tiltRatio = Math.min(1, Math.max(0, (progress - tiltStart) / (tiltEnd - tiltStart)));
    const smoothTilt = Math.sin(tiltRatio * Math.PI * 0.5);

    // Pitch: 0 = pointing UP -> -1.48 = nose pointing into screen (-Z), thrusters facing user (+Z)
    const pitch = -0.10 - smoothTilt * 1.38;

    // Inward aim toward name letters
    const inwardAim = smoothTilt * 0.18;

    // ==========================================
    // 3. AFTER TILTING AND IN NAME: SLOWLY DISAPPEAR
    // Only after they are tilted and in the name, they slowly fade and dissolve
    // ==========================================
    let fadeRatio = 0;
    let opacity = 1.0;
    let plungeZ = 0;

    if (progress > tiltEnd) {
      fadeRatio = Math.min(1, (progress - tiltEnd) / (disappearEnd - tiltEnd));
      // Smooth, gradual opacity decay: slowly disappears into the typography
      opacity = Math.max(0, 1 - Math.pow(fadeRatio, 1.25));
      // Plunges deep forward in Z as it enters the name
      plungeZ = Math.pow(fadeRatio, 1.3) * 7.5;
    }

    // Update material opacity across all ship meshes
    materialsRef.current.forEach((mat) => {
      if (mat) {
        mat.opacity = opacity;
      }
    });

    const distInFront = (isMobile ? 7.6 : 6.8) + plungeZ;
    const baseZ = camZ - distInFront;

    // Snappy, responsive damping
    const damp = 1 - Math.exp(-18 * delta);

    // Starship Transform (Left -> sweeps in from outside screen into "S. Gnan")
    star.position.x += (starTargetX - star.position.x) * damp;
    star.position.y += (baseY - star.position.y) * damp;
    star.position.z += (baseZ - star.position.z) * damp;

    // ISRO Transform (Right -> sweeps in from outside screen into "Charan")
    isro.position.x += (isroTargetX - isro.position.x) * damp;
    isro.position.y += (baseY - isro.position.y) * damp;
    isro.position.z += (baseZ - isro.position.z) * damp;

    // Flight attitude
    star.rotation.x += (pitch - star.rotation.x) * damp;
    star.rotation.y += (inwardAim - star.rotation.y) * damp;
    star.rotation.z += (0.04 - star.rotation.z) * damp;

    isro.rotation.x += (pitch - isro.rotation.x) * damp;
    isro.rotation.y += (-inwardAim - isro.rotation.y) * damp;
    isro.rotation.z += (-0.04 - isro.rotation.z) * damp;

    const baseScale = isMobile ? 0.28 : 0.44;
    // Scale remains 100% whole while flying in, then gently compresses as it enters the name
    const scaleFactor = baseScale * (1 - fadeRatio * 0.55);
    star.scale.setScalar(scaleFactor);
    isro.scale.setScalar(scaleFactor);

    // Full speed rocket vibration
    const jitter = Math.sin(t * 72) * 0.012 * maxSpeedThrust * opacity;
    star.position.y += jitter;
    isro.position.y -= jitter;

    // FULL SPEED FLAMES FACING USER: Roaring methalox / cryogenic plumes
    const flameFlicker = (1 + Math.sin(t * 44) * 0.18 + Math.cos(t * 62) * 0.12) * maxSpeedThrust * opacity;

    if (starshipFlameGroup.current) {
      starshipFlameGroup.current.scale.set(1, flameFlicker * 1.4, 1);
    }
    if (isroCoreFlameGroup.current) {
      isroCoreFlameGroup.current.scale.set(1, flameFlicker * 1.4, 1);
    }
    if (isroBoosterFlameGroupL.current) {
      isroBoosterFlameGroupL.current.scale.set(1, flameFlicker * 1.5, 1);
    }
    if (isroBoosterFlameGroupR.current) {
      isroBoosterFlameGroupR.current.scale.set(1, flameFlicker * 1.5, 1);
    }

    // Shock diamond pulse
    starshipDiamonds.current.forEach((dia, i) => {
      if (!dia) return;
      const dScale = (0.9 + Math.sin(t * 38 + i * 2) * 0.35) * maxSpeedThrust * opacity;
      dia.scale.set(dScale, dScale, dScale);
    });

    isroDiamonds.current.forEach((dia, i) => {
      if (!dia) return;
      const dScale = (0.9 + Math.sin(t * 36 + i * 1.8) * 0.35) * maxSpeedThrust * opacity;
      dia.scale.set(dScale, dScale, dScale);
    });

    // Exhaust sparks blasting from thrusters toward user
    particles.current.forEach((p, idx) => {
      if (!p) return;
      p.visible = opacity > 0.05;
      const opt = particleOffsets[idx];
      const pLife = (t * opt.speed * 2.0 + opt.phase) % 1;
      const shipGroup = opt.ship === "starship" ? star : isro;

      const thrustVectorZ = smoothTilt > 0.5 ? pLife * 4.8 : -pLife * 4.8;
      const thrustVectorY = smoothTilt > 0.5 ? 0 : -1.8;

      p.position.x = shipGroup.position.x + opt.x * (1 + pLife * 2.2);
      p.position.y = shipGroup.position.y + thrustVectorY + opt.z * (1 + pLife * 2.2);
      p.position.z = shipGroup.position.z + thrustVectorZ;

      const pScale = (1 - pLife) * 0.15 * maxSpeedThrust * opacity;
      p.scale.setScalar(pScale);
      (p.material as MeshBasicMaterial).opacity = (1 - pLife) * 0.85 * opacity;
    });
  });

  return (
    <group>
      {/* ========================================================
          1. SPACEX STARSHIP (LEFT SIDE OF SCREEN, IN FRAME)
          ======================================================== */}
      <group ref={starshipRoot} position={[-6.8, -2.85, 9]}>
        {/* Main Stainless Steel Cylindrical Fuselage */}
        <mesh position={[0, 0.4, 0]}>
          <cylinderGeometry args={[0.36, 0.36, 3.2, 24]} />
          <meshStandardMaterial
            color="#e2e8f0"
            metalness={0.96}
            roughness={0.12}
            transparent
            opacity={1}
          />
        </mesh>

        {/* Black Ceramic Heat-Shield Tile Half (Windward Side) */}
        <mesh position={[0, 0.4, 0.02]} rotation={[0, 0, 0]}>
          <cylinderGeometry args={[0.365, 0.365, 3.2, 24, 1, false, 0, Math.PI]} />
          <meshStandardMaterial
            color="#090d14"
            roughness={0.8}
            metalness={0.1}
            transparent
            opacity={1}
          />
        </mesh>

        {/* Starship Iconic Aerodynamic Gothic Nose Cone */}
        <mesh position={[0, 2.6, 0]}>
          <coneGeometry args={[0.36, 1.6, 24]} />
          <meshStandardMaterial
            color="#f1f5f9"
            metalness={0.96}
            roughness={0.12}
            transparent
            opacity={1}
          />
        </mesh>
        {/* Heat Shield Nose Tile Half */}
        <mesh position={[0, 2.6, 0.02]} rotation={[0, 0, 0]}>
          <coneGeometry args={[0.365, 1.6, 24, 1, false, 0, Math.PI]} />
          <meshStandardMaterial
            color="#090d14"
            roughness={0.8}
            metalness={0.1}
            transparent
            opacity={1}
          />
        </mesh>

        {/* Forward Canard Flaps */}
        <mesh position={[-0.42, 2.3, 0]} rotation={[0, 0, 0.25]}>
          <boxGeometry args={[0.38, 0.03, 0.28]} />
          <meshStandardMaterial
            color="#e2e8f0"
            metalness={0.92}
            roughness={0.2}
            transparent
            opacity={1}
          />
        </mesh>
        <mesh position={[0.42, 2.3, 0]} rotation={[0, 0, -0.25]}>
          <boxGeometry args={[0.38, 0.03, 0.28]} />
          <meshStandardMaterial
            color="#e2e8f0"
            metalness={0.92}
            roughness={0.2}
            transparent
            opacity={1}
          />
        </mesh>

        {/* Aft Body Flaps */}
        <mesh position={[-0.54, -0.6, 0]} rotation={[0, 0, 0.18]}>
          <boxGeometry args={[0.48, 0.04, 0.85]} />
          <meshStandardMaterial
            color="#cbd5e1"
            metalness={0.94}
            roughness={0.15}
            transparent
            opacity={1}
          />
        </mesh>
        <mesh position={[0.54, -0.6, 0]} rotation={[0, 0, -0.18]}>
          <boxGeometry args={[0.48, 0.04, 0.85]} />
          <meshStandardMaterial
            color="#cbd5e1"
            metalness={0.94}
            roughness={0.15}
            transparent
            opacity={1}
          />
        </mesh>

        {/* Raptor Engine Skirt & Nozzles */}
        <mesh position={[0, -1.35, 0]} rotation={[Math.PI, 0, 0]}>
          <cylinderGeometry args={[0.35, 0.38, 0.3, 24]} />
          <meshStandardMaterial
            color="#1e293b"
            metalness={0.85}
            roughness={0.25}
            transparent
            opacity={1}
          />
        </mesh>

        {/* Raptor Engine Bells */}
        {[-0.12, 0, 0.12].map((xOffset, idx) => (
          <mesh
            key={`star-rap-${idx}`}
            position={[xOffset, -1.55, 0]}
            rotation={[Math.PI, 0, 0]}
          >
            <cylinderGeometry args={[0.08, 0.13, 0.25, 14]} />
            <meshStandardMaterial
              color="#0f172a"
              metalness={0.95}
              roughness={0.15}
              transparent
              opacity={1}
            />
          </mesh>
        ))}

        {/* STARSHIP FLAME GROUP: Anchored strictly at nozzle lip [0, -1.68, 0], expanding ONLY downward */}
        <group ref={starshipFlameGroup} position={[0, -1.68, 0]}>
          {/* Supersonic Methalox Outer Plume */}
          <mesh position={[0, -1.4, 0]} rotation={[Math.PI, 0, 0]}>
            <coneGeometry args={[0.26, 2.8, 20]} />
            <meshBasicMaterial
              color="#38bdf8"
              transparent
              opacity={0.92}
              blending={AdditiveBlending}
            />
          </mesh>
          {/* Core White-Hot Shock Flame */}
          <mesh position={[0, -0.85, 0]} rotation={[Math.PI, 0, 0]}>
            <coneGeometry args={[0.13, 1.7, 20]} />
            <meshBasicMaterial
              color="#ffffff"
              transparent
              opacity={0.98}
              blending={AdditiveBlending}
            />
          </mesh>
          {/* Shock Diamonds */}
          {[0, 1, 2].map((i) => (
            <mesh
              key={`star-shock-${i}`}
              ref={(el) => {
                if (el) starshipDiamonds.current[i] = el;
              }}
              position={[0, -0.65 - i * 0.65, 0]}
            >
              <octahedronGeometry args={[0.075 - i * 0.012, 0]} />
              <meshBasicMaterial
                color="#e0f2fe"
                transparent
                opacity={0.95}
                blending={AdditiveBlending}
              />
            </mesh>
          ))}
        </group>
      </group>

      {/* ========================================================
          2. ISRO HEAVY LAUNCH VEHICLE (RIGHT SIDE OF SCREEN, IN FRAME)
          ======================================================== */}
      <group ref={isroRoot} position={[6.8, -2.85, 9]}>
        {/* Core Stage (L110 Liquid Core) */}
        <mesh position={[0, 0.4, 0]}>
          <cylinderGeometry args={[0.34, 0.34, 3.4, 20]} />
          <meshStandardMaterial
            color="#e2e8f0"
            metalness={0.3}
            roughness={0.35}
            transparent
            opacity={1}
          />
        </mesh>

        {/* Cable Raceway / Cryogenic Line running down the side */}
        <mesh position={[0.35, 0.35, 0]}>
          <boxGeometry args={[0.04, 3.2, 0.06]} />
          <meshStandardMaterial
            color="#334155"
            metalness={0.6}
            roughness={0.4}
            transparent
            opacity={1}
          />
        </mesh>

        {/* Upper Cryogenic Stage (C25) */}
        <mesh position={[0, 2.3, 0]}>
          <cylinderGeometry args={[0.32, 0.34, 1.2, 20]} />
          <meshStandardMaterial
            color="#cbd5e1"
            metalness={0.4}
            roughness={0.3}
            transparent
            opacity={1}
          />
        </mesh>

        {/* ISRO Saffron & Green Telemetry Bands */}
        <mesh position={[0, 1.85, 0]}>
          <cylinderGeometry args={[0.345, 0.345, 0.08, 20]} />
          <meshBasicMaterial color="#f97316" transparent opacity={1} />
        </mesh>
        <mesh position={[0, 1.74, 0]}>
          <cylinderGeometry args={[0.345, 0.345, 0.08, 20]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={1} />
        </mesh>
        <mesh position={[0, 1.63, 0]}>
          <cylinderGeometry args={[0.345, 0.345, 0.08, 20]} />
          <meshBasicMaterial color="#16a34a" transparent opacity={1} />
        </mesh>

        {/* Payload Fairing / Gaganyaan Orbital Module Capsule */}
        <mesh position={[0, 3.2, 0]}>
          <cylinderGeometry args={[0.12, 0.32, 1.1, 20]} />
          <meshStandardMaterial
            color="#f8fafc"
            metalness={0.25}
            roughness={0.2}
            transparent
            opacity={1}
          />
        </mesh>
        <mesh position={[0, 3.9, 0]}>
          <coneGeometry args={[0.12, 0.6, 20]} />
          <meshStandardMaterial
            color="#f8fafc"
            metalness={0.25}
            roughness={0.2}
            transparent
            opacity={1}
          />
        </mesh>

        {/* Launch Abort System Spike */}
        <mesh position={[0, 4.45, 0]}>
          <cylinderGeometry args={[0.02, 0.04, 0.6, 12]} />
          <meshStandardMaterial
            color="#475569"
            metalness={0.8}
            roughness={0.3}
            transparent
            opacity={1}
          />
        </mesh>
        <mesh position={[0, 4.8, 0]}>
          <coneGeometry args={[0.035, 0.15, 12]} />
          <meshStandardMaterial color="#e2e8f0" transparent opacity={1} />
        </mesh>

        {/* S200 SOLID ROCKET BOOSTERS (Twin Side Boosters) */}
        {/* Left S200 Booster */}
        <group position={[-0.56, -0.1, 0]}>
          <mesh>
            <cylinderGeometry args={[0.22, 0.22, 3.2, 18]} />
            <meshStandardMaterial
              color="#f1f5f9"
              metalness={0.3}
              roughness={0.35}
              transparent
              opacity={1}
            />
          </mesh>
          <mesh position={[0, 1.9, 0]}>
            <coneGeometry args={[0.22, 0.7, 18]} />
            <meshStandardMaterial
              color="#f8fafc"
              metalness={0.3}
              roughness={0.3}
              transparent
              opacity={1}
            />
          </mesh>
          <mesh position={[0, 2.15, 0]}>
            <coneGeometry args={[0.1, 0.25, 18]} />
            <meshBasicMaterial color="#f97316" transparent opacity={1} />
          </mesh>
          <mesh position={[0.16, 0.8, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.03, 0.03, 0.22, 8]} />
            <meshStandardMaterial color="#1e293b" metalness={0.7} transparent opacity={1} />
          </mesh>
          <mesh position={[0.16, -1.0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.03, 0.03, 0.22, 8]} />
            <meshStandardMaterial color="#1e293b" metalness={0.7} transparent opacity={1} />
          </mesh>
          {/* Nozzle */}
          <mesh position={[0, -1.75, 0]} rotation={[Math.PI, 0, 0]}>
            <cylinderGeometry args={[0.15, 0.22, 0.35, 14]} />
            <meshStandardMaterial
              color="#1e293b"
              metalness={0.8}
              roughness={0.25}
              transparent
              opacity={1}
            />
          </mesh>
        </group>

        {/* Right S200 Booster */}
        <group position={[0.56, -0.1, 0]}>
          <mesh>
            <cylinderGeometry args={[0.22, 0.22, 3.2, 18]} />
            <meshStandardMaterial
              color="#f1f5f9"
              metalness={0.3}
              roughness={0.35}
              transparent
              opacity={1}
            />
          </mesh>
          <mesh position={[0, 1.9, 0]}>
            <coneGeometry args={[0.22, 0.7, 18]} />
            <meshStandardMaterial
              color="#f8fafc"
              metalness={0.3}
              roughness={0.3}
              transparent
              opacity={1}
            />
          </mesh>
          <mesh position={[0, 2.15, 0]}>
            <coneGeometry args={[0.1, 0.25, 18]} />
            <meshBasicMaterial color="#f97316" transparent opacity={1} />
          </mesh>
          <mesh position={[-0.16, 0.8, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.03, 0.03, 0.22, 8]} />
            <meshStandardMaterial color="#1e293b" metalness={0.7} transparent opacity={1} />
          </mesh>
          <mesh position={[-0.16, -1.0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.03, 0.03, 0.22, 8]} />
            <meshStandardMaterial color="#1e293b" metalness={0.7} transparent opacity={1} />
          </mesh>
          {/* Nozzle */}
          <mesh position={[0, -1.75, 0]} rotation={[Math.PI, 0, 0]}>
            <cylinderGeometry args={[0.15, 0.22, 0.35, 14]} />
            <meshStandardMaterial
              color="#1e293b"
              metalness={0.8}
              roughness={0.25}
              transparent
              opacity={1}
            />
          </mesh>
        </group>

        {/* Core Vikas Engine Nozzles */}
        <mesh position={[-0.12, -1.45, 0]} rotation={[Math.PI, 0, 0]}>
          <cylinderGeometry args={[0.1, 0.16, 0.35, 14]} />
          <meshStandardMaterial
            color="#1e293b"
            metalness={0.9}
            roughness={0.2}
            transparent
            opacity={1}
          />
        </mesh>
        <mesh position={[0.12, -1.45, 0]} rotation={[Math.PI, 0, 0]}>
          <cylinderGeometry args={[0.1, 0.16, 0.35, 14]} />
          <meshStandardMaterial
            color="#1e293b"
            metalness={0.9}
            roughness={0.2}
            transparent
            opacity={1}
          />
        </mesh>

        {/* ISRO CORE FLAME GROUP: Anchored strictly at nozzle lip [0, -1.65, 0], expanding ONLY downward */}
        <group ref={isroCoreFlameGroup} position={[0, -1.65, 0]}>
          <mesh position={[0, -1.2, 0]} rotation={[Math.PI, 0, 0]}>
            <coneGeometry args={[0.26, 2.4, 16]} />
            <meshBasicMaterial
              color="#fb923c"
              transparent
              opacity={0.9}
              blending={AdditiveBlending}
            />
          </mesh>
          <mesh position={[0, -0.75, 0]} rotation={[Math.PI, 0, 0]}>
            <coneGeometry args={[0.13, 1.5, 16]} />
            <meshBasicMaterial
              color="#ffffff"
              transparent
              opacity={0.96}
              blending={AdditiveBlending}
            />
          </mesh>
          {/* Shock Diamonds */}
          {[0, 1, 2].map((i) => (
            <mesh
              key={`isro-shock-${i}`}
              ref={(el) => {
                if (el) isroDiamonds.current[i] = el;
              }}
              position={[0, -0.55 - i * 0.55, 0]}
            >
              <octahedronGeometry args={[0.08 - i * 0.012, 0]} />
              <meshBasicMaterial
                color="#ffffff"
                transparent
                opacity={0.92}
                blending={AdditiveBlending}
              />
            </mesh>
          ))}
        </group>

        {/* LEFT BOOSTER FLAME GROUP: Anchored strictly at nozzle lip [-0.56, -1.95, 0] */}
        <group ref={isroBoosterFlameGroupL} position={[-0.56, -1.95, 0]}>
          <mesh position={[0, -1.5, 0]} rotation={[Math.PI, 0, 0]}>
            <coneGeometry args={[0.25, 3.0, 16]} />
            <meshBasicMaterial
              color="#ea580c"
              transparent
              opacity={0.9}
              blending={AdditiveBlending}
            />
          </mesh>
          <mesh position={[0, -0.85, 0]} rotation={[Math.PI, 0, 0]}>
            <coneGeometry args={[0.12, 1.7, 16]} />
            <meshBasicMaterial
              color="#fef08a"
              transparent
              opacity={0.96}
              blending={AdditiveBlending}
            />
          </mesh>
        </group>

        {/* RIGHT BOOSTER FLAME GROUP: Anchored strictly at nozzle lip [0.56, -1.95, 0] */}
        <group ref={isroBoosterFlameGroupR} position={[0.56, -1.95, 0]}>
          <mesh position={[0, -1.5, 0]} rotation={[Math.PI, 0, 0]}>
            <coneGeometry args={[0.25, 3.0, 16]} />
            <meshBasicMaterial
              color="#ea580c"
              transparent
              opacity={0.9}
              blending={AdditiveBlending}
            />
          </mesh>
          <mesh position={[0, -0.85, 0]} rotation={[Math.PI, 0, 0]}>
            <coneGeometry args={[0.12, 1.7, 16]} />
            <meshBasicMaterial
              color="#fef08a"
              transparent
              opacity={0.96}
              blending={AdditiveBlending}
            />
          </mesh>
        </group>
      </group>

      {/* ========================================================
          3. HIGH-SPEED EXHAUST SPARKS FROM BOTH ROCKETS
          ======================================================== */}
      {particleOffsets.map((opt, i) => (
        <mesh
          key={`spark-race-${i}`}
          ref={(el) => {
            if (el) particles.current[i] = el;
          }}
          position={[0, -3, 0]}
        >
          <sphereGeometry args={[0.075, 8, 8]} />
          <meshBasicMaterial
            color={opt.ship === "starship" ? "#38bdf8" : "#ea580c"}
            transparent
            opacity={0.85}
            blending={AdditiveBlending}
          />
        </mesh>
      ))}
    </group>
  );
}
