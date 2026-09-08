"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { AdditiveBlending, BufferGeometry, Color, Float32BufferAttribute, Points } from "three";
import { viewportState } from "@/lib/scroll-state";

function hash(index: number, salt: number) {
  const n = Math.sin(index * 127.1 + salt * 311.7) * 43758.5453;
  return n - Math.floor(n);
}

export function StarField({ count = 2200 }: { count?: number }) {
  const points = useRef<Points>(null);

  const geometry = useMemo(() => {
    const geo = new BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const cyan = new Color("#9fd6ea");
    const ice = new Color("#dce9f5");
    const violet = new Color("#a9a0d8");

    for (let i = 0; i < count; i += 1) {
      const radius = 8 + Math.pow(hash(i, 1), 0.55) * 42;
      const theta = hash(i, 2) * Math.PI * 2;
      const phi = Math.acos(2 * hash(i, 3) - 1);
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta) * 0.72;
      positions[i * 3 + 2] = radius * Math.cos(phi) - 6;

      const mix = hash(i, 4);
      const color = mix > 0.82 ? violet : mix > 0.45 ? cyan : ice;
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    geo.setAttribute("position", new Float32BufferAttribute(positions, 3));
    geo.setAttribute("color", new Float32BufferAttribute(colors, 3));
    return geo;
  }, [count]);

  useFrame((_, delta) => {
    if (!points.current || viewportState.reducedMotion) return;
    points.current.rotation.y += delta * 0.012;
    points.current.rotation.x += delta * 0.003;
  });

  return (
    <points ref={points} geometry={geometry} frustumCulled={false}>
      <pointsMaterial
        vertexColors
        size={0.045}
        sizeAttenuation
        transparent
        opacity={0.85}
        depthWrite={false}
        blending={AdditiveBlending}
      />
    </points>
  );
}
