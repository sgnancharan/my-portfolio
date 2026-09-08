"use client";

import { useMemo, useRef, useSyncExternalStore } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import { viewportState } from "@/lib/scroll-state";
import { identityInteraction, subscribeIdentity } from "@/lib/identity-state";

const NODES = [
  { radius: 3.4, speed: 0.22, size: 0.09, color: "#9ec9dc", tilt: 0.18 },
  { radius: 4.3, speed: -0.14, size: 0.07, color: "#b7b0d8", tilt: 0.62 },
  { radius: 5.2, speed: 0.09, size: 0.11, color: "#d5e4ef", tilt: -0.28 },
] as const;

export function OrbitalSystem() {
  const root = useRef<Group>(null);
  const nodes = useRef<Group[]>([]);

  const isModalOpen = useSyncExternalStore(
    subscribeIdentity,
    () => identityInteraction.open !== null,
    () => false,
  );

  const rings = useMemo(() => NODES, []);

  useFrame((state, delta) => {
    if (!root.current) return;
    if (root.current.visible !== !isModalOpen) {
      root.current.visible = !isModalOpen;
    }
    if (isModalOpen || viewportState.reducedMotion) return;
    const t = state.clock.elapsedTime;
    if (root.current) root.current.rotation.y += delta * 0.04;
    nodes.current.forEach((node, index) => {
      if (!node) return;
      const def = rings[index];
      const angle = t * def.speed;
      node.position.set(
        Math.cos(angle) * def.radius,
        Math.sin(angle * 0.7) * 0.35,
        Math.sin(angle) * def.radius * 0.55,
      );
    });
  });

  return (
    <group ref={root} position={[0, 0, -1.5]}>
      {rings.map((ring, index) => (
        <group key={ring.radius} rotation={[ring.tilt, 0.2 * index, 0.1]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[ring.radius, 0.006, 8, 128]} />
            <meshBasicMaterial color={ring.color} transparent opacity={0.22} />
          </mesh>
          <group
            ref={(el) => {
              if (el) nodes.current[index] = el;
            }}
          >
            <mesh>
              <sphereGeometry args={[ring.size, 16, 16]} />
              <meshStandardMaterial
                color={ring.color}
                emissive={ring.color}
                emissiveIntensity={0.5}
                roughness={0.35}
                metalness={0.2}
              />
            </mesh>
          </group>
        </group>
      ))}
    </group>
  );
}
