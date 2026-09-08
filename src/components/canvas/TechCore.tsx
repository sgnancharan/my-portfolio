"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group, Mesh } from "three";
import { viewportState } from "@/lib/scroll-state";

export function TechCore() {
  const group = useRef<Group>(null);
  const inner = useRef<Mesh>(null);
  const ringA = useRef<Mesh>(null);
  const ringB = useRef<Mesh>(null);

  useFrame((state, delta) => {
    if (viewportState.reducedMotion) return;
    const t = state.clock.elapsedTime;
    if (group.current) {
      group.current.rotation.y += delta * 0.18;
      group.current.position.y = Math.sin(t * 0.6) * 0.08;
    }
    if (inner.current) inner.current.rotation.x += delta * 0.35;
    if (ringA.current) ringA.current.rotation.z += delta * 0.22;
    if (ringB.current) ringB.current.rotation.x -= delta * 0.16;
  });

  return (
    <group ref={group} position={[0, 0.1, 0]}>
      <mesh>
        <icosahedronGeometry args={[1.15, 1]} />
        <meshStandardMaterial
          color="#0c141c"
          metalness={0.72}
          roughness={0.28}
          emissive="#163044"
          emissiveIntensity={0.45}
        />
      </mesh>
      <mesh scale={1.015}>
        <icosahedronGeometry args={[1.15, 1]} />
        <meshBasicMaterial color="#7eb7d0" wireframe transparent opacity={0.28} />
      </mesh>
      <mesh ref={inner} scale={0.46}>
        <octahedronGeometry args={[1, 0]} />
        <meshStandardMaterial
          color="#c9d7e6"
          metalness={0.4}
          roughness={0.2}
          emissive="#4d7f98"
          emissiveIntensity={0.6}
        />
      </mesh>
      <mesh ref={ringA} rotation={[Math.PI / 2.4, 0.2, 0]}>
        <torusGeometry args={[1.85, 0.012, 12, 96]} />
        <meshBasicMaterial color="#8fb8cc" transparent opacity={0.55} />
      </mesh>
      <mesh ref={ringB} rotation={[0.4, Math.PI / 3, 0.5]}>
        <torusGeometry args={[2.25, 0.008, 12, 128]} />
        <meshBasicMaterial color="#8a7fb8" transparent opacity={0.35} />
      </mesh>
      <pointLight color="#9ec9dc" intensity={8} distance={12} />
    </group>
  );
}
