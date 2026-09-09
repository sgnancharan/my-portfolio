"use client";

import { Billboard, Text } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef, useSyncExternalStore } from "react";
import { DoubleSide, Group, Mesh } from "three";
import { viewportState } from "@/lib/scroll-state";
import { identityInteraction, subscribeIdentity } from "@/lib/identity-state";

interface CosmicNodeDef {
  name: string;
  category: "SKILL" | "PROJECT";
  color: string;
  pos: [number, number, number];
  size: number;
}

const COSMIC_ITEMS: CosmicNodeDef[] = [
  // Upper / Early Cosmos (Hero to About transition)
  { name: "DEBIAN 13 TRIXIE", category: "SKILL", color: "#38bdf8", pos: [-3.8, 1.8, 3], size: 0.28 },
  { name: "DOCKER SWARM", category: "SKILL", color: "#34d399", pos: [3.9, 0.6, 1], size: 0.32 },
  { name: "LOCAL AI RUNTIMES", category: "SKILL", color: "#fbbf24", pos: [-4.2, -1.4, -2], size: 0.3 },
  { name: "JELLYFIN SERVER", category: "PROJECT", color: "#a78bfa", pos: [4.4, 2.2, -1], size: 0.28 },

  // Mid Cosmos (Skills & Projects section)
  { name: "MBR RECOVERY", category: "SKILL", color: "#38bdf8", pos: [-3.6, 3.2, -6], size: 0.26 },
  { name: "WORKLOAD ISOLATION", category: "SKILL", color: "#34d399", pos: [3.6, -1.8, -8], size: 0.28 },
  { name: "SPACE HABITAT ARCH", category: "PROJECT", color: "#60a5fa", pos: [-4.4, 0.4, -10], size: 0.34 },
  { name: "ACCESS CONTROL", category: "SKILL", color: "#f472b6", pos: [4.2, 3.4, -11], size: 0.26 },
  { name: "CONTAINER OPS", category: "PROJECT", color: "#2dd4bf", pos: [-2.8, -2.4, -13], size: 0.3 },

  // Deep Cosmos (Space & Contact section)
  { name: "HPC OPTIMIZATION", category: "SKILL", color: "#fbbf24", pos: [3.5, 1.2, -16], size: 0.28 },
  { name: "ZERO-EGRESS AI", category: "PROJECT", color: "#a78bfa", pos: [-3.8, 2.6, -18], size: 0.32 },
  { name: "NEXT.JS / TYPESCRIPT", category: "SKILL", color: "#38bdf8", pos: [4.1, -1.2, -20], size: 0.28 },
  { name: "MEDIA PIPELINES", category: "SKILL", color: "#34d399", pos: [-3.2, -2.8, -22], size: 0.26 },
  { name: "HARDWARE DEBUGGING", category: "SKILL", color: "#f472b6", pos: [3.6, 2.8, -24], size: 0.28 },
  { name: "SYSTEM TELEMETRY", category: "SKILL", color: "#60a5fa", pos: [0, 3.8, -26], size: 0.3 },
];

export function CosmicNexus() {
  const root = useRef<Group>(null);
  const rings = useRef<(Mesh | null)[]>([]);

  const isModalOpen = useSyncExternalStore(
    subscribeIdentity,
    () => identityInteraction.open !== null,
    () => false,
  );

  useFrame((state, delta) => {
    if (!root.current) return;
    if (root.current.visible !== !isModalOpen) {
      root.current.visible = !isModalOpen;
    }
    if (isModalOpen || viewportState.reducedMotion) return;
    const t = state.clock.elapsedTime;

    rings.current.forEach((ring, idx) => {
      if (!ring) return;
      ring.rotation.z += delta * (0.3 + (idx % 3) * 0.15);
      ring.rotation.x = Math.sin(t * 0.4 + idx) * 0.25;
    });
  });

  return (
    <group ref={root}>
      {COSMIC_ITEMS.map((item, idx) => (
        <group key={item.name} position={item.pos}>
          {/* Luminous Core Sphere */}
          <mesh>
            <sphereGeometry args={[item.size, 20, 20]} />
            <meshStandardMaterial
              color={item.color}
              emissive={item.color}
              emissiveIntensity={0.85}
              roughness={0.2}
              metalness={0.3}
            />
          </mesh>

          {/* Orbiting Planetary Micro-Ring */}
          <mesh
            ref={(el) => {
              rings.current[idx] = el;
            }}
            rotation={[Math.PI / 3, 0.2 * idx, 0]}
          >
            <ringGeometry args={[item.size * 1.55, item.size * 1.72, 32]} />
            <meshBasicMaterial
              color={item.color}
              transparent
              opacity={0.45}
              side={DoubleSide}
            />
          </mesh>

          {/* Facing 3D Label & Category Indicator */}
          <Billboard follow lockX={false} lockY={false} lockZ={false}>
            <group position={[0, item.size + 0.32, 0]}>
              <Text
                fontSize={0.19}
                letterSpacing={0.12}
                color="#f8fafc"
                anchorX="center"
                anchorY="middle"
                outlineWidth={0.03}
                outlineColor="#020617"
              >
                {item.name}
              </Text>
              <Text
                position={[0, -0.19, 0]}
                fontSize={0.1}
                letterSpacing={0.2}
                color={item.color}
                anchorX="center"
                anchorY="middle"
              >
                [{item.category}]
              </Text>
            </group>
          </Billboard>
        </group>
      ))}
    </group>
  );
}
