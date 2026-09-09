"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  AdditiveBlending,
  CanvasTexture,
  Color,
  DoubleSide,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Points,
  Vector3,
} from "three";
import { getIndianFlagTexture } from "@/lib/flag-texture";
import {
  getLaunchIntroSnapshot,
  launchIntroState,
  subscribeLaunchIntro,
} from "@/lib/launch-intro-state";
import { viewportState } from "@/lib/scroll-state";

// 1,400 GPU transition particles that morph from fiery rocket exhaust to cosmic stardust
const NUM_PARTICLES = 1400;

interface ParticleData {
  // Exhaust trail coordinate
  trailX: number;
  trailY: number;
  trailZ: number;
  // Cosmos stardust coordinate
  cosmosX: number;
  cosmosY: number;
  cosmosZ: number;
  // Particle dynamics
  speed: number;
  phase: number;
  size: number;
}

export function IsroLaunchComplex() {
  const [flagTexture, setFlagTexture] = useState<CanvasTexture | null>(null);
  const rootRef = useRef<Group>(null);
  const baseGroupRef = useRef<Group>(null);
  const rocketGroupRef = useRef<Group>(null);
  const umbilicalArm1Ref = useRef<Group>(null);
  const umbilicalArm2Ref = useRef<Group>(null);
  const flameGroupRef = useRef<Group>(null);
  const launchLightRef = useRef<Group>(null);
  const groundSmokeRef = useRef<Group>(null);
  const transitionPointsRef = useRef<Points>(null);

  // Load flag texture on client
  useEffect(() => {
    try {
      const tex = getIndianFlagTexture();
      setFlagTexture(tex);
    } catch {
      // fallback handled gracefully
    }
  }, []);

  // Pre-generate dual-state coordinates for the critical exhaust -> stardust transition
  const { particleData, positionsArray, colorsArray } = useMemo(() => {
    const pData: ParticleData[] = [];
    const pos = new Float32Array(NUM_PARTICLES * 3);
    const col = new Float32Array(NUM_PARTICLES * 3);

    for (let i = 0; i < NUM_PARTICLES; i++) {
      // 1. Initial exhaust trail geometry (expanding cone below rocket nozzles)
      const tSpread = Math.pow(Math.random(), 0.65) * 2.8;
      const tAngle = Math.random() * Math.PI * 2;
      const tY = -Math.random() * 9.5;
      const trailX = Math.cos(tAngle) * tSpread * (1 - tY * 0.22);
      const trailZ = Math.sin(tAngle) * tSpread * (1 - tY * 0.22);

      // 2. Cosmic stardust target geometry (spherical starfield surrounding camera at [0, 0, 16])
      const cRadius = 4.5 + Math.random() * 24;
      const cTheta = Math.random() * Math.PI * 2;
      const cPhi = Math.acos(2 * Math.random() - 1);
      const cosmosX = cRadius * Math.sin(cPhi) * Math.cos(cTheta);
      const cosmosY = cRadius * Math.sin(cPhi) * Math.sin(cTheta) * 0.75 + 0.35;
      const cosmosZ = cRadius * Math.cos(cPhi) + 8;

      pData.push({
        trailX,
        trailY: tY,
        trailZ,
        cosmosX,
        cosmosY,
        cosmosZ,
        speed: 1.2 + Math.random() * 2.4,
        phase: Math.random() * Math.PI * 2,
        size: 0.035 + Math.random() * 0.05,
      });

      pos[i * 3] = trailX;
      pos[i * 3 + 1] = tY;
      pos[i * 3 + 2] = trailZ;

      // Fiery golden initial color
      col[i * 3] = 1.0;
      col[i * 3 + 1] = 0.65;
      col[i * 3 + 2] = 0.2;
    }

    return { particleData: pData, positionsArray: pos, colorsArray: col };
  }, []);

  // Frame loop handling liftoff dynamics, smoke expansion, and exhaust morphing
  useFrame((state, delta) => {
    const snap = getLaunchIntroSnapshot();

    // If intro completed, hide complex completely to preserve 100% GPU performance
    if (snap.isComplete) {
      if (rootRef.current && rootRef.current.visible) {
        rootRef.current.visible = false;
      }
      return;
    }

    if (rootRef.current && !rootRef.current.visible) {
      rootRef.current.visible = true;
    }

    // Hide launchpad base structures in background before loading into hero section
    if (baseGroupRef.current) {
      baseGroupRef.current.visible = snap.baseVisible && !snap.isComplete;
    }

    const t = state.clock.elapsedTime;
    const isMobile = viewportState.isMobile;

    // 1. Move Rocket vertically along launch rail
    if (rocketGroupRef.current) {
      rocketGroupRef.current.position.y = snap.rocketY;

      // Subtle aerodynamic vibration at high thrust
      if (snap.engineThrust > 0 && snap.rocketY < 20) {
        const jitter = Math.sin(t * 70) * (snap.cameraShake * 0.012);
        rocketGroupRef.current.position.x = jitter;
        rocketGroupRef.current.position.z = jitter * 0.5;
      } else {
        rocketGroupRef.current.position.x = 0;
        rocketGroupRef.current.position.z = 0;
      }
    }

    // 2. Umbilical swing arms retraction during countdown
    const isRetracting = snap.phase === "COUNTDOWN" || snap.phase === "IGNITION" || snap.phase === "LIFTOFF" || snap.phase === "TRANSITION";
    const targetArmAngle = isRetracting ? -0.85 : 0;
    if (umbilicalArm1Ref.current) {
      umbilicalArm1Ref.current.rotation.y += (targetArmAngle - umbilicalArm1Ref.current.rotation.y) * delta * 2.8;
    }
    if (umbilicalArm2Ref.current) {
      umbilicalArm2Ref.current.rotation.y += (targetArmAngle - umbilicalArm2Ref.current.rotation.y) * delta * 2.8;
    }

    // 3. Engine Flames pulsation and thrust scaling
    if (flameGroupRef.current) {
      if (snap.engineThrust > 0.01) {
        flameGroupRef.current.visible = true;
        const pulse = 1 + Math.sin(t * 45) * 0.12 + Math.cos(t * 80) * 0.08;
        flameGroupRef.current.scale.set(
          snap.engineThrust * pulse,
          snap.engineThrust * (1.2 + Math.sin(t * 50) * 0.25),
          snap.engineThrust * pulse
        );
      } else {
        flameGroupRef.current.visible = false;
      }
    }

    // 4. Ground Smoke Billowing across pad during ignition
    if (groundSmokeRef.current) {
      if (snap.phase === "IGNITION" || (snap.phase === "LIFTOFF" && snap.rocketY < 14)) {
        groundSmokeRef.current.visible = true;
        groundSmokeRef.current.children.forEach((child, idx) => {
          const m = child as Mesh;
          if (m) {
            const rot = (idx % 2 === 0 ? 1 : -1) * 0.4 * delta;
            m.rotation.y += rot;
            const targetScale = 1 + (idx * 0.15) + (snap.rocketY * 0.18);
            m.scale.set(targetScale, targetScale * 0.65, targetScale);
          }
        });
      } else if (snap.rocketY >= 14 || snap.phase === "TRANSITION") {
        groundSmokeRef.current.visible = false;
      }
    }

    // 5. Critical Transition: Exhaust Particle Morphing into Cosmic Stardust
    if (transitionPointsRef.current) {
      const geo = transitionPointsRef.current.geometry;
      const posAttr = geo.getAttribute("position");
      const colAttr = geo.getAttribute("color");

      if (posAttr && colAttr) {
        const positions = posAttr.array as Float32Array;
        const colors = colAttr.array as Float32Array;

        const expansion = snap.exhaustExpansion; // 0 to 1
        const morph = snap.stardustMorph; // 0 to 1
        const rY = snap.rocketY;

        // Colors: Fiery Orange -> Cosmic Cyan & Ice Violet
        const cFireR = 1.0;
        const cFireG = 0.62;
        const cFireB = 0.18;

        const cCosmicR = 0.22;
        const cCosmicG = 0.74;
        const cCosmicB = 0.97;

        const curR = cFireR + (cCosmicR - cFireR) * morph;
        const curG = cFireG + (cCosmicG - cFireG) * morph;
        const curB = cFireB + (cCosmicB - cFireB) * morph;

        for (let i = 0; i < NUM_PARTICLES; i++) {
          const pd = particleData[i];

          // Coordinate follows rocket while in liftoff, then expands and morphs to cosmos
          const rocketBaseY = rY - 2.8;

          // Exhaust trail coordinate in world space
          const exWorldX = pd.trailX * (1 + expansion * 6.5);
          const exWorldY = rocketBaseY + pd.trailY * (1 + expansion * 4.2) - (expansion * 12);
          const exWorldZ = pd.trailZ * (1 + expansion * 6.5) + (expansion * 16.5);

          // Interpolate between exhaust plume and cosmic starfield
          const finalX = exWorldX + (pd.cosmosX - exWorldX) * morph;
          const finalY = exWorldY + (pd.cosmosY - exWorldY) * morph;
          const finalZ = exWorldZ + (pd.cosmosZ - exWorldZ) * morph;

          positions[i * 3] = finalX;
          positions[i * 3 + 1] = finalY;
          positions[i * 3 + 2] = finalZ;

          // Color transition
          colors[i * 3] = curR;
          colors[i * 3 + 1] = curG;
          colors[i * 3 + 2] = curB;
        }

        posAttr.needsUpdate = true;
        colAttr.needsUpdate = true;
      }
    }
  });

  return (
    <group ref={rootRef}>
      {/* ========================================================
          1. NIGHTTIME SRIHARIKOTA ATMOSPHERE & BASE LAUNCHPAD STRUCTURES
          Removed from background before loading into hero section
          ======================================================== */}
      <group ref={baseGroupRef}>
        {/* Heavy Launchpad Pedestal & Flame Trench */}
        <group position={[0, -3.2, 0]}>
        {/* Reinforced Concrete Launch Table */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[5.2, 5.8, 1.2, 12]} />
          <meshStandardMaterial
            color="#18202c"
            metalness={0.4}
            roughness={0.65}
          />
        </mesh>

        {/* Hazard Yellow-Black Perimeter Trim */}
        <mesh position={[0, 0.62, 0]}>
          <cylinderGeometry args={[5.22, 5.22, 0.08, 12]} />
          <meshStandardMaterial color="#eab308" roughness={0.5} />
        </mesh>

        {/* Dual Flame Deflector Trench Cavity */}
        <mesh position={[0, 0.2, 0]}>
          <boxGeometry args={[3.2, 1.0, 4.4]} />
          <meshStandardMaterial color="#080c14" roughness={0.9} />
        </mesh>

        {/* Curved Exhaust Deflector Plates (channels exhaust horizontally) */}
        <mesh position={[0, -0.2, 0]} rotation={[Math.PI / 4, 0, 0]}>
          <boxGeometry args={[2.8, 0.2, 2.6]} />
          <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.3} />
        </mesh>
      </group>

      {/* ========================================================
          2. ISRO UMBILICAL LAUNCH TOWER (LUT)
          Sriharikota red steel lattice structure with swing arms
          ======================================================== */}
      <group position={[-2.4, -2.6, -0.6]}>
        {/* Main Vertical Red Steel Columns */}
        <mesh position={[-0.8, 5.2, -0.8]}>
          <boxGeometry args={[0.22, 12.5, 0.22]} />
          <meshStandardMaterial color="#b91c1c" metalness={0.6} roughness={0.4} />
        </mesh>
        <mesh position={[0.8, 5.2, -0.8]}>
          <boxGeometry args={[0.22, 12.5, 0.22]} />
          <meshStandardMaterial color="#b91c1c" metalness={0.6} roughness={0.4} />
        </mesh>
        <mesh position={[-0.8, 5.2, 0.8]}>
          <boxGeometry args={[0.22, 12.5, 0.22]} />
          <meshStandardMaterial color="#b91c1c" metalness={0.6} roughness={0.4} />
        </mesh>
        <mesh position={[0.8, 5.2, 0.8]}>
          <boxGeometry args={[0.22, 12.5, 0.22]} />
          <meshStandardMaterial color="#b91c1c" metalness={0.6} roughness={0.4} />
        </mesh>

        {/* Multi-Tier Work Platforms */}
        {[1, 3, 5, 7, 9, 11].map((lvlY) => (
          <group key={lvlY} position={[0, lvlY, 0]}>
            <mesh>
              <boxGeometry args={[1.9, 0.12, 1.9]} />
              <meshStandardMaterial color="#334155" metalness={0.7} roughness={0.3} />
            </mesh>
            {/* Platform Safety Railing */}
            <mesh position={[0, 0.25, 0.9]}>
              <boxGeometry args={[1.85, 0.35, 0.04]} />
              <meshBasicMaterial color="#e2e8f0" wireframe />
            </mesh>
          </group>
        ))}

        {/* Swing Umbilical Service Arm 1 (Cryogenic stage feed line) */}
        <group ref={umbilicalArm1Ref} position={[0.8, 4.2, 0.5]}>
          <mesh position={[1.1, 0, 0]}>
            <boxGeometry args={[2.2, 0.16, 0.2]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.7} roughness={0.3} />
          </mesh>
          <mesh position={[2.2, -0.15, 0]}>
            <cylinderGeometry args={[0.04, 0.04, 0.4, 8]} />
            <meshStandardMaterial color="#475569" />
          </mesh>
        </group>

        {/* Swing Umbilical Service Arm 2 (Payload Fairing umbilical) */}
        <group ref={umbilicalArm2Ref} position={[0.8, 7.8, 0.5]}>
          <mesh position={[1.0, 0, 0]}>
            <boxGeometry args={[2.0, 0.16, 0.2]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.7} roughness={0.3} />
          </mesh>
          <mesh position={[2.0, -0.2, 0]}>
            <cylinderGeometry args={[0.04, 0.04, 0.5, 8]} />
            <meshStandardMaterial color="#475569" />
          </mesh>
        </group>

        {/* Top Lightning Arrestor Mast */}
        <mesh position={[0, 12.4, 0]}>
          <cylinderGeometry args={[0.04, 0.12, 2.6, 8]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.9} roughness={0.2} />
        </mesh>
        {/* Red Aviation Warning Beacon on Tower Top */}
        <mesh position={[0, 13.7, 0]}>
          <sphereGeometry args={[0.08, 12, 12]} />
          <meshBasicMaterial color="#ef4444" />
        </mesh>
      </group>

      {/* Flanking Pad Lightning Protection Tower */}
      <group position={[3.2, -2.6, -1.2]}>
        <mesh position={[0, 5, 0]}>
          <cylinderGeometry args={[0.08, 0.35, 12, 6]} />
          <meshStandardMaterial color="#475569" metalness={0.7} roughness={0.4} wireframe />
        </mesh>
        <mesh position={[0, 11.2, 0]}>
          <cylinderGeometry args={[0.02, 0.08, 2.2, 6]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.9} />
        </mesh>
        <mesh position={[0, 12.3, 0]}>
          <sphereGeometry args={[0.07, 8, 8]} />
          <meshBasicMaterial color="#ef4444" />
        </mesh>
      </group>

      {/* Staging Floodlights illuminating the Indian Launch Vehicle */}
      <group ref={launchLightRef}>
        {/* Left Floodlight */}
        <spotLight
          position={[-3.8, 1.2, 4.2]}
          target-position={[0, 2.5, 0]}
          intensity={2.8}
          distance={28}
          angle={0.65}
          penumbra={0.5}
          color="#d7e6f2"
        />
        {/* Right Floodlight */}
        <spotLight
          position={[3.8, 1.2, 4.2]}
          target-position={[0, 2.5, 0]}
          intensity={2.8}
          distance={28}
          angle={0.65}
          penumbra={0.5}
          color="#d7e6f2"
        />
        {/* Dynamic Engine Flame Pointlight */}
        <pointLight
          position={[0, -2.2, 0]}
          intensity={launchIntroState.engineThrust * 16}
          distance={22}
          color="#f97316"
        />
      </group>

      {/* Billowing Ground Smoke Puffs during Ignition */}
      <group ref={groundSmokeRef} position={[0, -2.4, 0]} visible={false}>
        {[-2.2, -1.1, 0, 1.1, 2.2].map((xOffset, i) => (
          <mesh key={i} position={[xOffset, 0.2, (i % 2 === 0 ? 0.8 : -0.8)]}>
            <sphereGeometry args={[0.85 + (i % 3) * 0.2, 14, 14]} />
            <meshStandardMaterial
              color="#cbd5e1"
              transparent
              opacity={0.45}
              roughness={0.9}
              depthWrite={false}
            />
          </mesh>
        ))}
      </group>
      </group>

      {/* ========================================================
          3. THE INDIAN LAUNCH VEHICLE (LVM3 / GSLV Mk III)
          Equipped with authentic Indian Tricolor 🇮🇳 naturally placed
          ======================================================== */}
      <group ref={rocketGroupRef} position={[0, 0, 0]}>
        {/* --- Central Core Stage (L110 Liquid Core) --- */}
        <mesh position={[0, 0.4, 0]}>
          <cylinderGeometry args={[0.68, 0.68, 4.8, 28]} />
          <meshStandardMaterial
            color="#f1f5f9"
            metalness={0.3}
            roughness={0.32}
          />
        </mesh>

        {/* External Cryogenic Feed Ducts / Cable Raceways */}
        <mesh position={[0.7, 0.4, 0]}>
          <boxGeometry args={[0.06, 4.6, 0.08]} />
          <meshStandardMaterial color="#334155" metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh position={[-0.7, 0.4, 0]}>
          <boxGeometry args={[0.06, 4.6, 0.08]} />
          <meshStandardMaterial color="#334155" metalness={0.7} roughness={0.3} />
        </mesh>

        {/* ISRO Saffron & Green Accent Livery Rings */}
        <mesh position={[0, 2.4, 0]}>
          <cylinderGeometry args={[0.685, 0.685, 0.12, 28]} />
          <meshBasicMaterial color="#FF671F" />
        </mesh>
        <mesh position={[0, 2.26, 0]}>
          <cylinderGeometry args={[0.685, 0.685, 0.12, 28]} />
          <meshBasicMaterial color="#FFFFFF" />
        </mesh>
        <mesh position={[0, 2.12, 0]}>
          <cylinderGeometry args={[0.685, 0.685, 0.12, 28]} />
          <meshBasicMaterial color="#046A38" />
        </mesh>

        {/* --- C25 Cryogenic Upper Stage --- */}
        <mesh position={[0, 3.4, 0]}>
          <cylinderGeometry args={[0.64, 0.68, 1.8, 28]} />
          <meshStandardMaterial
            color="#e2e8f0"
            metalness={0.4}
            roughness={0.28}
          />
        </mesh>

        {/* --- Payload Fairing (Ogive Nose Cone) --- */}
        <mesh position={[0, 4.8, 0]}>
          <cylinderGeometry args={[0.3, 0.64, 1.4, 28]} />
          <meshStandardMaterial
            color="#f8fafc"
            metalness={0.25}
            roughness={0.2}
          />
        </mesh>
        <mesh position={[0, 5.8, 0]}>
          <coneGeometry args={[0.3, 0.9, 28]} />
          <meshStandardMaterial
            color="#f8fafc"
            metalness={0.25}
            roughness={0.2}
          />
        </mesh>

        {/* Launch Abort System / Spike at apex */}
        <mesh position={[0, 6.6, 0]}>
          <cylinderGeometry args={[0.03, 0.06, 0.8, 12]} />
          <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[0, 7.1, 0]}>
          <coneGeometry args={[0.04, 0.25, 12]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.9} />
        </mesh>

        {/* --- OFFICIAL INDIAN NATIONAL FLAG 🇮🇳 (Naturally integrated on rocket core) --- */}
        {flagTexture && (
          <mesh position={[0, 3.25, 0.685]}>
            <planeGeometry args={[0.82, 0.55]} />
            <meshStandardMaterial
              map={flagTexture}
              roughness={0.25}
              metalness={0.15}
              polygonOffset
              polygonOffsetFactor={-1}
            />
          </mesh>
        )}

        {/* --- Twin S200 Solid Rocket Boosters (Strapped to Sides) --- */}
        {/* Left S200 Booster */}
        <group position={[-1.15, -0.3, 0]}>
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.44, 0.44, 5.4, 24]} />
            <meshStandardMaterial
              color="#f8fafc"
              metalness={0.3}
              roughness={0.35}
            />
          </mesh>
          {/* Booster Nose Cone */}
          <mesh position={[0, 3.2, 0]}>
            <coneGeometry args={[0.44, 1.1, 24]} />
            <meshStandardMaterial color="#f8fafc" metalness={0.3} roughness={0.3} />
          </mesh>
          {/* Saffron Nose Cap */}
          <mesh position={[0, 3.65, 0]}>
            <coneGeometry args={[0.18, 0.35, 24]} />
            <meshBasicMaterial color="#FF671F" />
          </mesh>
          {/* Indian Flag on Left Booster Forward Section */}
          {flagTexture && (
            <mesh position={[0.12, 1.8, 0.445]} rotation={[0, 0.2, 0]}>
              <planeGeometry args={[0.55, 0.37]} />
              <meshStandardMaterial
                map={flagTexture}
                roughness={0.3}
                polygonOffset
                polygonOffsetFactor={-1}
              />
            </mesh>
          )}
          {/* Heavy Structural Mounting Struts to Core */}
          <mesh position={[0.3, 1.4, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.06, 0.06, 0.45, 10]} />
            <meshStandardMaterial color="#1e293b" metalness={0.8} />
          </mesh>
          <mesh position={[0.3, -1.8, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.08, 0.08, 0.45, 10]} />
            <meshStandardMaterial color="#1e293b" metalness={0.8} />
          </mesh>
          {/* Aft Flared Gimbal Nozzle */}
          <mesh position={[0, -3.1, 0]} rotation={[Math.PI, 0, 0]}>
            <cylinderGeometry args={[0.28, 0.42, 0.6, 20]} />
            <meshStandardMaterial color="#1e293b" metalness={0.85} roughness={0.25} />
          </mesh>
        </group>

        {/* Right S200 Booster */}
        <group position={[1.15, -0.3, 0]}>
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.44, 0.44, 5.4, 24]} />
            <meshStandardMaterial
              color="#f8fafc"
              metalness={0.3}
              roughness={0.35}
            />
          </mesh>
          {/* Booster Nose Cone */}
          <mesh position={[0, 3.2, 0]}>
            <coneGeometry args={[0.44, 1.1, 24]} />
            <meshStandardMaterial color="#f8fafc" metalness={0.3} roughness={0.3} />
          </mesh>
          {/* Saffron Nose Cap */}
          <mesh position={[0, 3.65, 0]}>
            <coneGeometry args={[0.18, 0.35, 24]} />
            <meshBasicMaterial color="#FF671F" />
          </mesh>
          {/* Indian Flag on Right Booster Forward Section */}
          {flagTexture && (
            <mesh position={[-0.12, 1.8, 0.445]} rotation={[0, -0.2, 0]}>
              <planeGeometry args={[0.55, 0.37]} />
              <meshStandardMaterial
                map={flagTexture}
                roughness={0.3}
                polygonOffset
                polygonOffsetFactor={-1}
              />
            </mesh>
          )}
          {/* Heavy Structural Mounting Struts to Core */}
          <mesh position={[-0.3, 1.4, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.06, 0.06, 0.45, 10]} />
            <meshStandardMaterial color="#1e293b" metalness={0.8} />
          </mesh>
          <mesh position={[-0.3, -1.8, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.08, 0.08, 0.45, 10]} />
            <meshStandardMaterial color="#1e293b" metalness={0.8} />
          </mesh>
          {/* Aft Flared Gimbal Nozzle */}
          <mesh position={[0, -3.1, 0]} rotation={[Math.PI, 0, 0]}>
            <cylinderGeometry args={[0.28, 0.42, 0.6, 20]} />
            <meshStandardMaterial color="#1e293b" metalness={0.85} roughness={0.25} />
          </mesh>
        </group>

        {/* --- Engine Nozzles at Base of Core --- */}
        <group position={[0, -2.3, 0]}>
          <mesh position={[-0.26, 0, 0]} rotation={[Math.PI, 0, 0]}>
            <cylinderGeometry args={[0.16, 0.28, 0.48, 16]} />
            <meshStandardMaterial color="#1e293b" metalness={0.85} roughness={0.25} />
          </mesh>
          <mesh position={[0.26, 0, 0]} rotation={[Math.PI, 0, 0]}>
            <cylinderGeometry args={[0.16, 0.28, 0.48, 16]} />
            <meshStandardMaterial color="#1e293b" metalness={0.85} roughness={0.25} />
          </mesh>
        </group>

        {/* ========================================================
            4. ENGINE IGNITION & THRUST FLAMES (Multi-layered Volumetric)
            ======================================================== */}
        <group ref={flameGroupRef} position={[0, -3.2, 0]} visible={false}>
          {/* Left S200 Booster Flame Jet */}
          <group position={[-1.15, -0.3, 0]}>
            {/* Inner Core Flame (Incandescent White) */}
            <mesh position={[0, -1.6, 0]} rotation={[Math.PI, 0, 0]}>
              <coneGeometry args={[0.32, 3.4, 16]} />
              <meshBasicMaterial color="#ffffff" transparent opacity={0.95} blending={AdditiveBlending} />
            </mesh>
            {/* Mid Flame (Bright Golden-Orange) */}
            <mesh position={[0, -2.1, 0]} rotation={[Math.PI, 0, 0]}>
              <coneGeometry args={[0.55, 4.4, 16]} />
              <meshBasicMaterial color="#f59e0b" transparent opacity={0.8} blending={AdditiveBlending} />
            </mesh>
            {/* Outer Plume (Fiery Amber) */}
            <mesh position={[0, -2.6, 0]} rotation={[Math.PI, 0, 0]}>
              <coneGeometry args={[0.82, 5.6, 16]} />
              <meshBasicMaterial color="#ea580c" transparent opacity={0.45} blending={AdditiveBlending} />
            </mesh>
            {/* Shock Diamonds */}
            {[0.8, 1.6, 2.4, 3.2].map((dY, idx) => (
              <mesh key={idx} position={[0, -dY, 0]}>
                <octahedronGeometry args={[0.15 - idx * 0.02, 0]} />
                <meshBasicMaterial color="#fffbeb" transparent opacity={0.9} blending={AdditiveBlending} />
              </mesh>
            ))}
          </group>

          {/* Right S200 Booster Flame Jet */}
          <group position={[1.15, -0.3, 0]}>
            <mesh position={[0, -1.6, 0]} rotation={[Math.PI, 0, 0]}>
              <coneGeometry args={[0.32, 3.4, 16]} />
              <meshBasicMaterial color="#ffffff" transparent opacity={0.95} blending={AdditiveBlending} />
            </mesh>
            <mesh position={[0, -2.1, 0]} rotation={[Math.PI, 0, 0]}>
              <coneGeometry args={[0.55, 4.4, 16]} />
              <meshBasicMaterial color="#f59e0b" transparent opacity={0.8} blending={AdditiveBlending} />
            </mesh>
            <mesh position={[0, -2.6, 0]} rotation={[Math.PI, 0, 0]}>
              <coneGeometry args={[0.82, 5.6, 16]} />
              <meshBasicMaterial color="#ea580c" transparent opacity={0.45} blending={AdditiveBlending} />
            </mesh>
            {[0.8, 1.6, 2.4, 3.2].map((dY, idx) => (
              <mesh key={idx} position={[0, -dY, 0]}>
                <octahedronGeometry args={[0.15 - idx * 0.02, 0]} />
                <meshBasicMaterial color="#fffbeb" transparent opacity={0.9} blending={AdditiveBlending} />
              </mesh>
            ))}
          </group>

          {/* Central Vikas Core Engine Flame */}
          <group position={[0, 0.4, 0]}>
            <mesh position={[0, -1.4, 0]} rotation={[Math.PI, 0, 0]}>
              <coneGeometry args={[0.38, 3.2, 16]} />
              <meshBasicMaterial color="#38bdf8" transparent opacity={0.85} blending={AdditiveBlending} />
            </mesh>
            <mesh position={[0, -1.8, 0]} rotation={[Math.PI, 0, 0]}>
              <coneGeometry args={[0.62, 4.0, 16]} />
              <meshBasicMaterial color="#f59e0b" transparent opacity={0.65} blending={AdditiveBlending} />
            </mesh>
          </group>
        </group>
      </group>

      {/* ========================================================
          5. THE CRITICAL EXHAUST -> STARDUST MORPHING PARTICLES
          ======================================================== */}
      <points ref={transitionPointsRef} frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positionsArray, 3]}
          />
          <bufferAttribute
            attach="attributes-color"
            args={[colorsArray, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          vertexColors
          size={0.065}
          sizeAttenuation
          transparent
          opacity={0.88}
          depthWrite={false}
          blending={AdditiveBlending}
        />
      </points>
    </group>
  );
}
